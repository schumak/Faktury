# Serializéry pro převod Django modelů (Person, Invoice) do JSON a zpět.
# Používá se v API pro práci s osobami a fakturami.

from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from .models import Person, Invoice


# ─────────────────────────────────────────────
#  PERSON SERIALIZER
# ─────────────────────────────────────────────
# Serializér osoby – převádí model Person na JSON a zpět.
# Obsahuje pole použité ve formuláři osoby.
class PersonSerializer(serializers.ModelSerializer):
    # _id – jen pro výstup, aby frontend nemusel pracovat s interním "id"
    # identificationNumber – IČO, defaultně None pokud chybí
    _id = serializers.IntegerField(source="id", read_only=True)
    identificationNumber = serializers.CharField(default=None)

    class Meta:
        # Seznam polí, která budou dostupná ve výstupu API.
        model = Person
        fields = [
            "name",
            "identificationNumber",
            "taxNumber",
            "accountNumber",
            "bankCode",
            "iban",
            "telephone",
            "mail",
            "street",
            "zip",
            "city",
            "country",
            "note",
            "_id",
        ]


# ─────────────────────────────────────────────
#  SPECIAL FIELD FOR INVOICE (Person as object)
# ─────────────────────────────────────────────
# Speciální pole pro faktury – umožňuje v JSONu posílat jen {"_id": X},
# ale uvnitř serializeru pracovat s plnou instancí Person.
class InvoicePersonField(serializers.Field):
    """
    Vstup JSON:  {"_id": 1}
    Uvnitř:      Person instance (FK)
    Výstup JSON: celý objekt osoby přes PersonSerializer
    """

    def to_representation(self, value):
        # Při výstupu faktury vracíme celý objekt osoby přes PersonSerializer
        return PersonSerializer(value).data

    def to_internal_value(self, data):
        # Při příjmu JSONu očekáváme slovník s klíčem "_id"
        if not isinstance(data, dict) or "_id" not in data:
            raise ValidationError('Pole musí mít tvar: {"_id": <id osoby>}')

        # Pokus o převod ID na číslo
        person_id = data["_id"]

        try:
            person_id = int(person_id)
        except (TypeError, ValueError):
            raise ValidationError('Hodnota "_id" musí být číslo.')

        # Ověření, že osoba existuje v databázi
        try:
            return Person.objects.get(pk=person_id)
        except Person.DoesNotExist:
            raise ValidationError(f"Osoba s id={person_id} neexistuje.")


# ─────────────────────────────────────────────
#  INVOICE SERIALIZER – FULL DETAIL
# ─────────────────────────────────────────────
# Kompletní serializer faktury – používá se pro detail, vytvoření i editaci.
# Obsahuje vnořené objekty dodavatele a odběratele.
class InvoiceSerializer(serializers.ModelSerializer):
    _id = serializers.IntegerField(source="id", read_only=True)

    # invoiceNumber – mapuje na interní pole invoice_number v modelu
    # dueDate – mapuje na modelové pole due_date
    invoiceNumber = serializers.CharField(
        source="invoice_number",
        required=False,
        allow_blank=True,
    )
    dueDate = serializers.DateField(source="due_date")

    # seller / buyer – vnořené osoby, validované přes InvoicePersonField
    seller = InvoicePersonField()
    buyer = InvoicePersonField()

    class Meta:
        # Seznam polí vrácených API v plném detailu faktury.
        model = Invoice
        fields = [
            "invoiceNumber",
            "seller",
            "buyer",
            "issued",
            "dueDate",
            "product",
            "price",
            "vat",
            "note",
            "archived",
            "_id",
        ]


# ─────────────────────────────────────────────
#  BONUS: FAST LISTING (BEZ VNOŘENÝCH OBJEKTŮ)
# ─────────────────────────────────────────────
# Rychlý serializer pro tabulkové výpisy – vrací jen základní informace.
# Nenačítá celé vnořené objekty (lepší výkon v přehledech).
class InvoiceListSerializer(serializers.ModelSerializer):
    """
    Rychlý serializer pro tabulkový / přehledový výpis.
    Ideální pro /api/invoices nebo tabulky Purchases/Sales.
    """

    # Odvozené (read-only) názvy dodavatele / odběratele
    sellerName = serializers.CharField(source="seller.name", read_only=True)
    buyerName = serializers.CharField(source="buyer.name", read_only=True)

    class Meta:
        # Minimální sada polí potřebná pro přehled faktur.
        model = Invoice
        fields = [
            "invoiceNumber",
            "sellerName",
            "buyerName",
            "issued",
            "price",
            "_id",
        ]