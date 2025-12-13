# ViewSet a API endpointy pro práci s osobami.
# Obsahuje CRUD operace a statistiky tržeb na osobu.

from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum

from ..serializers import PersonSerializer
from ..models import Person, Invoice


# Hlavní ViewSet pro osoby – pracuje pouze s nesmazanými (hidden=False).
# update() provádí "soft delete" původní osoby a vytvoří její novou verzi.
# destroy() pouze nastaví hidden=True.
class PersonViewSet(viewsets.ModelViewSet):
    queryset = Person.objects.filter(hidden=False)
    serializer_class = PersonSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        # Validace příchozích dat
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Označíme původní záznam jako skrytý (soft delete)
        instance.hidden = True
        instance.save(update_fields=["hidden"])

        # Připravíme čistá data pro vytvoření nové verze osoby
        validated_data = serializer.validated_data
        validated_data.pop("hidden", None)

        # Vytvoření nové osoby se stejnými daty
        new_instance = Person.objects.create(**validated_data, hidden=False)

        # Vracíme klientovi nově vytvořenou osobu
        output_serializer = self.get_serializer(new_instance)
        return Response(output_serializer.data, status=status.HTTP_200_OK)

    # Smazání osoby – pouze nastaví hidden=True (soft delete)
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.hidden = True
        instance.save(update_fields=["hidden"])
        return Response(status=status.HTTP_204_NO_CONTENT)


# API endpoint pro statistiky osob – počítá tržby každé osoby podle jejích prodaných faktur.
# Lze přepnout, zda se mají zahrnout i "smazané" osoby.
class PersonStatisticsView(APIView):
    # GET /api/persons/statistics
    # Volitelný query param ?include_hidden=true zobrazí i „smazané“ (hidden) osoby.
    # Bez parametru se počítají jen nesmazané (hidden=False).

    def get(self, request):
        # Zjištění, zda zahrnout i skryté osoby
        include_hidden = request.query_params.get("include_hidden") == "true"

        # Sestavení querysetu osob podle parametru
        persons_qs = Person.objects.all()
        if not include_hidden:
            persons_qs = persons_qs.filter(hidden=False)

        results = []

        for p in persons_qs:
            # Výpočet tržeb dané osoby (součet price u faktur, kde je seller daná osoba)
            revenue = (
                Invoice.objects.filter(seller=p).aggregate(total=Sum("price"))["total"]
                or 0
            )

            results.append(
                {
                    "personId": p.id,
                    "personName": p.name,
                    "revenue": revenue,
                }
            )

        # Výsledkem je seznam objektů s personId, personName a revenue
        return Response(results)