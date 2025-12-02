from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db.models import Sum
from rest_framework.decorators import action
from ..models import Person, Invoice
from ..serializers import InvoiceSerializer

class PurchasesByIdentificationView(APIView):
    def get(self, request, ico):
        persons = Person.objects.filter(identificationNumber=ico)
        if not persons.exists():
            return Response(
                {
                    "invoices": [],
                    "message": f"Osoba s IČ {ico} nebyla nalezena.",
                    "count": 0,
                },
                status=status.HTTP_200_OK,
            )

        person_ids = persons.values_list("id", flat=True)
        invoices = Invoice.objects.filter(buyer_id__in=person_ids)
        serializer = InvoiceSerializer(invoices, many=True)
        data = serializer.data

        return Response(
            {
                "invoices": data,
                "count": len(data),
            },
            status=status.HTTP_200_OK,
        )

class SalesByIdentificationView(APIView):
    def get(self, request, ico):
        persons = Person.objects.filter(identificationNumber=ico)
        if not persons.exists():
            return Response(
                {
                    "invoices": [],
                    "message": f"Osoba s IČ {ico} nebyla nalezena.",
                    "count": 0,
                },
                status=status.HTTP_200_OK,
            )

        person_ids = persons.values_list("id", flat=True)
        invoices = Invoice.objects.filter(seller_id__in=person_ids)
        serializer = InvoiceSerializer(invoices, many=True)
        data = serializer.data

        return Response(
            {
                "invoices": data,
                "count": len(data),
            },
            status=status.HTTP_200_OK,
        )
