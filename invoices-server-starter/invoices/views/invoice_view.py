# ViewSet pro práci s fakturami – poskytuje CRUD operace, filtrování a statistiky.
# Používá Django REST Framework ModelViewSet.
from rest_framework import viewsets, status
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from django.db.models import Sum


from ..models import Invoice
from ..serializers import InvoiceSerializer

# Hlavní ViewSet pro API faktur. Obsahuje:
# - CRUD operace
# - vlastní endpoint /statistics
# - rozsáhlé filtrování přes query parametry
# - akci archive (POST /{id}/archive/)
class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.filter(hidden=False)
    serializer_class = InvoiceSerializer

    @action(detail=False, methods=["get"], url_path="statistics")
    def statistics(self, request):
        # Endpoint vracející přehled základních součtů (aktuální rok, celkově, počet faktur)
        # /api/invoices/statistics
        # Vrací:
        # - currentYearSum: součet cen za aktuální rok
        # - allTimeSum: součet cen za všechny roky
        # - invoicesCount: počet faktur v databázi
        # Zjištění aktuálního roku pro filtrování
        today = timezone.now().date()
        current_year = today.year

        # Výpočet sumy všech faktur a sumy pouze za aktuální rok
        qs = Invoice.objects.all()
        all_time_sum = qs.aggregate(total=Sum("price"))["total"] or 0
        current_year_sum = (
            qs.filter(issued__year=current_year).aggregate(total=Sum("price"))["total"]
            or 0
        )
        invoices_count = qs.count()

        return Response(
            {
                "currentYearSum": current_year_sum,
                "allTimeSum": all_time_sum,
                "invoicesCount": invoices_count,
            }
        )

    # Dynamické filtrování podle query parametrů – filtruje jen nearchivované faktury
    # Podporované parametry: buyerID, sellerID, product, minPrice, maxPrice, limit
    def get_queryset(self):
        # základní queryset – jen nearchivované faktury, s nataženým seller/buyer
        qs = Invoice.objects.filter(archived=False).select_related("seller", "buyer")

        params = self.request.query_params

        # buyerID – filtr na odběratele
        # buyerID – faktury s daným odběratelem (buyer)
        buyer_id = params.get("buyerID")
        if buyer_id:
            qs = qs.filter(buyer__id=buyer_id)

        # sellerID – filtr na dodavatele
        # sellerID – faktury s daným dodavatelem (seller)
        seller_id = params.get("sellerID")
        if seller_id:
            qs = qs.filter(seller__id=seller_id)

        # product – fulltext (case-insensitive) v názvu produktu
        # product – faktury obsahující daný produkt (case-insensitive)
        product = params.get("product")
        if product:
            qs = qs.filter(product__icontains=product)

        # minPrice – minimální cena
        # minPrice – částka >= minPrice
        min_price = params.get("minPrice")
        if min_price:
            qs = qs.filter(price__gte=min_price)

        # maxPrice – maximální cena
        # maxPrice – částka <= maxPrice
        max_price = params.get("maxPrice")
        if max_price:
            qs = qs.filter(price__lte=max_price)

        # limit – omezí počet vrácených faktur, musí být kladné číslo
        # limit – maximální počet vrácených faktur
        limit = params.get("limit")
        if limit:
            try:
                limit = int(limit)
                if limit > 0:
                    qs = qs[:limit]
            except ValueError:
                # když pošleš blbost, limit ignorujeme
                pass

        return qs

    # Archivace faktury – nastaví archived=True a vrací upravenou fakturu
    @action(detail=True, methods=["post"])
    def archive(self, request, pk=None):
        # Archivuje fakturu – nastaví archived = True.
        # Volá se jako POST /api/invoices/{id}/archive/
        invoice = self.get_object()
        invoice.archived = True
        invoice.save()
        serializer = self.get_serializer(invoice)
        return Response(serializer.data, status=status.HTTP_200_OK)