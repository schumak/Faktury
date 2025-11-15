# invoices/views/invoice_view.py
from rest_framework import viewsets, status
from rest_framework.response import Response

from ..models import Invoice
from ..serializers import InvoiceSerializer


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.filter(hidden=False)
    serializer_class = InvoiceSerializer

    def get_queryset(self):
        # základní queryset – jen nearchivované faktury, s nataženým seller/buyer
        qs = Invoice.objects.filter(archived=False).select_related("seller", "buyer")

        params = self.request.query_params

        # buyerID – faktury s daným odběratelem (buyer)
        buyer_id = params.get("buyerID")
        if buyer_id:
            qs = qs.filter(buyer__id=buyer_id)

        # sellerID – faktury s daným dodavatelem (seller)
        seller_id = params.get("sellerID")
        if seller_id:
            qs = qs.filter(seller__id=seller_id)

        # product – faktury obsahující daný produkt (case-insensitive)
        product = params.get("product")
        if product:
            qs = qs.filter(product__icontains=product)

        # minPrice – částka >= minPrice
        min_price = params.get("minPrice")
        if min_price:
            qs = qs.filter(price__gte=min_price)

        # maxPrice – částka <= maxPrice
        max_price = params.get("maxPrice")
        if max_price:
            qs = qs.filter(price__lte=max_price)

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


    # def update(self, request, *args, **kwargs):
    #     instance = self.get_object()

    #     serializer = self.get_serializer(data=request.data)
    #     serializer.is_valid(raise_exception=True)

    #     instance.hidden = True
    #     instance.save(update_fields=["hidden"])

    #     validated_data = serializer.validated_data
    #     validated_data.pop("hidden", None)  # klient nesmí řídit hidden

    #     new_instance = Invoice.objects.create(**validated_data, hidden=False)

    #     output_serializer = self.get_serializer(new_instance)
    #     return Response(output_serializer.data, status=status.HTTP_200_OK)

    # def destroy(self, request, *args, **kwargs):
    #     instance = self.get_object()
    #     instance.hidden = True
    #     instance.save(update_fields=["hidden"])
    #     return Response(status=status.HTTP_204_NO_CONTENT)