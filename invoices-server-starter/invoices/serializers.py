# invoice_app/serializers.py

from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from .models import Person, Invoice


# ─────────────────────────────────────────────
#  PERSON SERIALIZER
# ─────────────────────────────────────────────
class PersonSerializer(serializers.ModelSerializer):
    _id = serializers.IntegerField(source="id", read_only=True)
    identificationNumber = serializers.CharField(default=None)

    class Meta:
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
class InvoicePersonField(serializers.Field):
    """
    Vstup JSON:  {"_id": 1}
    Uvnitř:      Person instance (FK)
    Výstup JSON: celý objekt osoby přes PersonSerializer
    """

    def to_representation(self, value):
        # PERSON → JSON pro výstup
        return PersonSerializer(value).data

    def to_internal_value(self, data):
        # JSON → PERSON instance (rutiny pro POST/PUT)
        if not isinstance(data, dict) or "_id" not in data:
            raise ValidationError('Pole musí mít tvar: {"_id": <id osoby>}')

        person_id = data["_id"]

        try:
            person_id = int(person_id)
        except (TypeError, ValueError):
            raise ValidationError('Hodnota "_id" musí být číslo.')

        try:
            return Person.objects.get(pk=person_id)
        except Person.DoesNotExist:
            raise ValidationError(f"Osoba s id={person_id} neexistuje.")


# ─────────────────────────────────────────────
#  INVOICE SERIALIZER – FULL DETAIL
# ─────────────────────────────────────────────
class InvoiceSerializer(serializers.ModelSerializer):
    _id = serializers.IntegerField(source="id", read_only=True)

    invoiceNumber = serializers.CharField(
        source="invoice_number",
        required=False,
        allow_blank=True,
    )
    dueDate = serializers.DateField(source="due_date")

    seller = InvoicePersonField()
    buyer = InvoicePersonField()

    class Meta:
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
class InvoiceListSerializer(serializers.ModelSerializer):
    """
    Rychlý serializer pro tabulkový / přehledový výpis.
    Ideální pro /api/invoices or /sales/purchases tabulky.
    """
    sellerName = serializers.CharField(source="seller.name", read_only=True)
    buyerName = serializers.CharField(source="buyer.name", read_only=True)

    class Meta:
        model = Invoice
        fields = [
            "invoiceNumber",
            "sellerName",
            "buyerName",
            "issued",
            "price",
            "_id",
        ]
