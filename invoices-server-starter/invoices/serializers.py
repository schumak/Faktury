from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from .models import Person, Invoice


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


class InvoicePersonField(serializers.Field):
    """
    Vstup JSON:  {"_id": 1}
    Uvnitř:      Person instance
    Výstup JSON: celý objekt osoby přes PersonSerializer
    """

    def to_representation(self, value):
        return PersonSerializer(value).data

    def to_internal_value(self, data):
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

class InvoiceSerializer(serializers.ModelSerializer):
    _id = serializers.IntegerField(source="id", read_only=True)

    # mapování názvů z frontendu na názvy v modelu
    invoiceNumber = serializers.CharField(source="invoice_number")
    dueDate = serializers.DateField(source="due_date")

    # seller / buyer – nested objekt s {_id: X} na vstupu, plný objekt na výstupu
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