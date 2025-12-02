# Boldog Karácsonyt Sanyi!!!
## The Floor - Online Kvíz Játék Használati Útmutató

Ez a doksi segít neked a játék telepítésében, testreszabásában és használatában.

## 1. Előkészületek

Ahhoz, hogy fusson a gép, ezek kellenek a gépedre:
- **Python** (3.13 ajánlott nekem azzal megy): [Letöltés](https://www.python.org/downloads/)
- **Node.js** (Frontendhez): [Letöltés](https://nodejs.org/)

## 2. Telepítés

1.  Nyisd meg a `The-Floor` mappát.
2.  Kattints duplán az **`install.bat`** fájlra.
3.  Várd meg, amíg végigmegy (egy fekete ablak fog felugrani). A végén kiírja, hogy "Telepites sikeres!".

> **Megjegyzés:** Ezt csak egyszer kell lefuttatnod, az első használat előtt, vagy ha valamit frissítettünk a kódban.

## 3. A Játék Indítása

1.  Kattints duplán a **`run.bat`** fájlra.
2.  Felugrik egy fekete ablak (ez a szerver, ezt **ne zárd be**, amíg játszani akarsz!).
3.  Automatikusan megnyílik a böngészőben a játék (`http://localhost:8000`).
    - A legjobb élményért nyomj egy **F11**-et (teljes képernyő).

## 4. Játékmenet és Vezérlés

Mindent egy felületről tudsz irányítani, akár kivetíted, akár nem.

### Főképernyő (Pálya)
- **Kategória választás**: Kattints rá arra, amelyikkel játszani akartok.
- **Mystery Mode**: A képernyő alján lévő gombbal kapcsolhatod be a "Titkos módot". Ilyenkor a kategóriák neve helyett "???" látszik, és a kártyák átfordulnak. Megjegyzi a beállítást a következő játékra is.
- **Pálya Reset**: Törli a lejátszott kategóriákat (hogy újra ki tudd választani őket).

### Játék Előkészítése
- Ha választottál kategóriát, írd be a két játékos nevét.
- **Kihívó (Fenti oldal)**: Az a játékos, aki választott, vagy aki éppen soron van. Ő kezd (de átírhatod, ha máshogy akarjátok).
- **Kihívott (Lenti oldal)**: Az ellenfél.
- Kattints az **INDÍTÁS** gombra a kezdéshez.

### Játék Közben
Megjelenik a kép.
- **Helyes Válasz**: 
  - Kattints a **HELYES** gombra vagy nyomd meg az **ENTER**-t.
  - Ezzel elfogadod a választ, megáll az idő, és jön a másik játékos a kövi képpel.
- **Passz**: 
  - Kattints a **PASSZ** gombra vagy nyomd meg a **P** betűt.
  - Megjelenik a helyes megfejtés, de az idő tovább pörög.
  - A játékosnak a következő képpel újra próbálkoznia kell (vagy nyomhatsz Entert a tovább lépéshez).
- **Megszakítás**: Az **X** gombra kattintva bármikor leállíthatod a játékot és visszajutsz a pályára.

### Játék Vége (Eredményhirdetés)
- Ha valakinek lejár az ideje, vagy elfogynak a képek, vége a körnek.
- Látványos animációval megjelenik a győztes neve.
- Ha a képek fogytak el (tehát a kategória teljesítve lett), mindkét játékos megmaradt ideje látható.
- A "Vissza a pályára" gombbal visszajutsz a főmenübe.

## 5. Képek Automatikus Letöltése (download_real_images.py)

A `download_real_images.py` script segítségével automatikusan letöltheted a képeket a Google Képekből a SerpAPI szolgáltatás használatával.

### 5.1. SERP API KEY Beállítása

A script két módon tudja betölteni az API kulcsot:

**`env_var.py` fájl használata**
1.  A `scripts/env_var.py` fájlban add meg az API kulcsot:
    ```python
    SERP_API_KEY="xxx"
    ```
    
### 5.2. Script Futtatása

1.  Nyisd meg a terminált/parancssort a projekt mappájában.
2.  Aktiváld a virtuális környezetet (ha még nem aktív):
    ```bash
    venv\Scripts\activate
    ```
3.  Futtasd a scriptet:
    ```bash
    python scripts\download_real_images.py
    ```

### 5.3. Hogyan Működik?

- A script automatikusan letölti a képeket a `CATEGORIES` szótárban definiált kategóriákhoz és tételekhez.
- A képeket a `data` mappába menti, kategóriánként külön almappákba.
- A fájlnevek automatikusan formázottak: `01_Név.jpg`, `02_Név.jpg`, stb.
- A script törli a régi `data` mappát, mielőtt új képeket tölt le.

### 5.4. Kategóriák Testreszabása

A `scripts/download_real_images.py` fájlban módosíthatod a `CATEGORIES` szótárat, hogy saját kategóriákat és tételeket adj hozzá:

```python
CATEGORIES = {
    "Kategória neve": [
        "Tétel 1", "Tétel 2", "Tétel 3", ...
    ],
    ...
}
```

> **Fontos:** A kategória neveknek pontosan egyezniük kell a játékban használt nevekkel!

## 6. Saját Képek Manuális Hozzáadása

Ha nem szeretnél automatikus letöltést használni, manuálisan is hozzáadhatsz képeket:

A játék automatikusan beolvassa a képeket a `data` mappából.

1.  Nyisd meg a `data` mappát.
2.  Hozz létre egy új mappát a kategória nevével (pl. `Híres Emberek`).
3.  Másold be a képeket ebbe a mappába.
4.  **Elnevezés (Fontos!)**: 
    A képek sorrendjéhez és a megfejtéshez használd a `SS_Megfejtés.jpg` formátumot (ahol SS a sorszám).
    -   **Helyes**: `01_Brad Pitt.jpg`, `02_Angelina Jolie.jpg`
    -   **Eredmény**: A játékban sorrendben jönnek. A képernyőn a sorszám NEM látszik, csak a név ("Brad Pitt").
5.  Indítsd újra a játékot (zárd be a `run.bat` ablakát, majd indítsd el újra), hogy beolvassa az új képeket.