# Audioproductie – nieuwe talen

Dit document houdt de tekst- en audioproductie bij voor Oekraïens, Japans, Vietnamees en Frysk (Fryslân).

## Bestandsconventie

Per taal moeten exact 15 MP3-bestanden worden toegevoegd:

`audio/<taalcode>/stop-01.mp3` t/m `audio/<taalcode>/stop-15.mp3`

De speler in de website gebruikt deze paden rechtstreeks. Een taal mag pas aan de taalkeuzelijst worden toegevoegd wanneer zowel alle 15 teksten als alle 15 afspeelbare MP3-bestanden aanwezig zijn en gecontroleerd zijn.

## Status

| Taal | Code | Teksten | Audio | Activeren |
|---|---|---:|---:|---|
| Oekraïens | uk | 15/15 conceptvertaling | 0/15 | geblokkeerd |
| Japans | ja | 15/15 conceptvertaling | 0/15 | geblokkeerd |
| Vietnamees | vi | 15/15 conceptvertaling | 0/15 | geblokkeerd |
| Frysk (Fryslân) | fy | 15/15 conceptvertaling | 0/15 | geblokkeerd |

**Let op:** de nieuwe teksten zijn als complete eerste vertaalversies voorbereid. Laat ze vóór opname bij voorkeur nalezen door een moedertaalspreker, met extra aandacht voor plaatsnamen, historische termen en uitspraak.

## Controle per audiobestand

Voor elk bestand:

- [ ] juiste taal en juiste halte
- [ ] volledige tekst ingesproken; geen ontbrekende zinnen
- [ ] natuurlijke uitspraak en verstaanbaar tempo
- [ ] pauzes, sfeer- en loopinstructies behouden
- [ ] MP3-bestand opent en speelt af
- [ ] geen stilte, afkapping of beschadiging aan begin/einde
- [ ] bestandsnaam exact volgens de conventie

## Haltes

Voor iedere taal worden deze bestanden verwacht:

- [ ] stop-01.mp3
- [ ] stop-02.mp3
- [ ] stop-03.mp3
- [ ] stop-04.mp3
- [ ] stop-05.mp3
- [ ] stop-06.mp3
- [ ] stop-07.mp3
- [ ] stop-08.mp3
- [ ] stop-09.mp3
- [ ] stop-10.mp3
- [ ] stop-11.mp3
- [ ] stop-12.mp3
- [ ] stop-13.mp3
- [ ] stop-14.mp3
- [ ] stop-15.mp3

## Automatische controle

Voer vanuit de repository-root uit:

`node scripts/check-language-readiness.js`

Dit controleert de aanwezigheid van 15 teksten per taal, de zes belangrijkste UI-woordenboeken en 15 niet-lege MP3-bestanden. De controle is structureel: zij vervangt geen moedertaalcontrole, luistertest of praktijktest in de browser. De bestaande audiocontrole kan apart worden uitgevoerd met `node scripts/check-audio.js`.

## Publicatiepoort

Een taal blijft verborgen in de taalkeuze totdat:
1. alle 15 vertalingen aanwezig zijn en taalkundig zijn nagekeken;
2. alle 15 MP3's zijn gegenereerd en gecontroleerd;
3. de taalinterface volledig is vertaald;
4. een praktijktest van laden en afspelen is geslaagd.

Er worden geen lege MP3's of tijdelijke stiltes gebruikt om ontbrekende audio te maskeren.
