# Forms-clone-SOAP

## Ülevaade
See projekt loob SOAP versiooni olemasolevast Forms-clone REST API-st. Eesmärk on pakkuda samasugust funktsionaalsust kasutades SOAP protokolli, mis võimaldab olemasoleva Forms rakenduse funktsionaalsust kasutada ka SOAP-põhistes süsteemides.

## Funktsionaalsus
Nii REST kui ka SOAP API pakuvad identset funktsionaalsust, sealhulgas:

- **Kasutajate haldus** (loomine, lugemine, uuendamine, kustutamine)
- **Autentimine** (sisselogimine, väljalogimine)
- **Vormide haldus** (loomine, vaatamine, muutmine, kustutamine)
- **Küsimuste haldus** (lisamine, muutmine, kustutamine)
- **Vastuste haldus** (esitamine, vaatamine)

## Projekti Struktuur
```
├── wsdl/                    # WSDL ja XSD failid teenuse kirjeldamiseks
├── src/                     # SOAP teenuse lähtekood
│   ├── controllers/         # Äriloogika kontrollerid
│   ├── models/              # Andmemudelid
│   ├── services/            # SOAP teenused
│   └── utils/               # Abifunktsioonid
├── scripts/
│   └── run.sh               # Käivitusskript
├── client/
│   └── example/             # Kliendi näidised teenuse kasutamiseks
├── tests/
│   └── test.sh              # Automaattestid
├── forms-clone-api/         # Originaalne REST API (olemasolev)
└── README.md                # Projekti dokumentatsioon
```

## Eeldused
- Node.js (v14 või uuem)
- npm (v6 või uuem)

## Paigaldamine
1. Klooni repositoorium:
```bash
git clone <repositooriumi-url>
cd Forms-clone-SOAP
```

2. Paigalda sõltuvused:
```bash
npm install
```

3. Seadista keskkonna muutujad:
```bash
cp src/config/.env.example src/config/.env
# Muuda .env faili vastavalt vajadusele
```

## Ülesande Kirjeldus
Projekt koosneb järgmistest osadest:

1. **WSDL ja XSD Definitsioonid**: REST API põhjal luuakse WSDL ja XSD failid, mis kirjeldavad teenuse funktsionaalsust ja andmestruktuure.

2. **SOAP Teenused**: Implementeeritakse SOAP protokollil põhinevad teenused, mis pakuvad samu võimalusi kui REST API:
   - Kasutajate haldus (registreerimine, autentimine)
   - Vormide loomine ja haldamine
   - Küsimuste lisamine vormidesse
   - Vastuste salvestamine ja päringud

3. **Kliendi Näidised**: Luuakse näidiskliendid, mis demonstreerivad teenuse kasutamist.

4. **Testid**: Automaattestid teenuse funktsionaalsuse kontrollimiseks.


## Käivitamine
### Teenuste käivitamine
Lihtsaim viis SOAP teenuse käivitamiseks on:

```bash
cd scripts
./run.sh
```

See:
- Käivitab andmebaasi initsialiseerimise (kui vajalik)
- Käivitab SOAP teenuse pordil 3001

Teenused on kättesaadavad järgmistel aadressidel:
- SOAP lõpp-punkt: http://localhost:3001/soap/formsclone
- WSDL: http://localhost:3001/soap/formsclone?wsdl

Alternatiivina võib kasutada Docker-it:
```bash
docker-compose up
```

### SOAP kliendi kasutamine
Näidisklient on saadaval demonstreerimaks kõiki SOAP operatsioone. Kliendi käivitamiseks:

```bash
node client/example/client.js
```

See näitab:
- Kasutaja loomist, sisselogimist ja tokeni saamist
- Kõiki CRUD operatsioone kasutajate, vormide, küsimuste ja vastuste jaoks

## Testimine
Testid kontrollivad, et SOAP API pakub samaväärset funktsionaalsust REST API-ga.

Automaattestide käivitamiseks:

```bash
cd tests
./test.sh
```

### Mida testid kontrollivad
- Mõlemad API-d tagastavad samaväärseid andmestruktuure
- Mõlemad API-d rakendavad samu valideerimisreegleid
- Mõlemad API-d käsitlevad CRUD operatsioone identselt
- Autentimine töötab mõlemas API-s samal viisil

## API dokumentatsioon
SOAP API dokumentatsioon on saadaval WSDL failina: `wsdl/formsClone.wsdl`

### WSDL üksikasjad
WSDL fail (`wsdl/formsClone.wsdl`) defineerib:
- Kõik andmetüübid kasutades XML Schema-t
- Operatsioonid, mis vastavad REST API endpointidele
- SOAP sidumine kõikide operatsioonide jaoks
- Teenuse lõpp-punkti üksikasjad

## Vigade käsitlemine
SOAP API kasutab standardseid SOAP Fault sõnumeid veaolukordade jaoks, sealhulgas:
- Kliendi vead (400-taseme HTTP ekvivalendid)
- Serveri vead (500-taseme HTTP ekvivalendid)
- Autentimise/autoriseerimise tõrked

