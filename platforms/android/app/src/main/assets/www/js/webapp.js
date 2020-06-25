
/**
 * WebApp functions. Requires 'alasql' and 'Chart.js'.
 */

/**
 * variable to toggle view of chart vs view of tables
 */
let chartDisplay = false; /** chart display Variable wird global zur Verfügung gestellt, wird verwendet, um zu merken, was aktuell dargestellt wird (Tabelle oder Graphisch)) wenn true --> graphisch wenn false --> tabelle
                            an dieser Stelle false damit wenn die Datei geladen wird der Chart nicht angezeigt wird */

/**
 *  constant values used for the calculations = Variablen Wert kann nicht geändert werden 
 */
const KIRCHENSTEUER_SATZ = 0.09;
const SOLI_SATZ = 0.055;
const KK_SATZ = 0.075;
const PV_SATZ_OHNE_KINDER = 0.033;
const PV_SATZ_MIT_KINDER = 0.0305;
const PV_ALTER_GRENZE = 23;
const ARBEITSLOSENVERSICHERUNG_SATZ = 0.024;
const RENTENVERSICHERUNG_SATZ = 0.093;


/**
 * create the database and tables for storing and retrieving the data.
 * The database will keep the following information for the user:
 * nummer (the record's primary key)
 * age (we use age because alter is a reserved word in SQL)
 * kinder
 * brutto
 * netto
 * lohnsteuerbetrag
 * kirchensteuer
 * solidaritaetszuschlag
 * krankenkassenbeitrag
 * pflegeversicherung
 * arbeitslosenversicherung
 * rentenversicherung
 * 
 * The database and tables is created only once.
 * It uses localStorage to store the database for keeping data over a page refresh.
 */ 
const createDatabase = function() { /** alasql Schnittstelle - führt SQL aus, da Library implementiert ist, In Memory oder Local Storage wird erzeugt 
                                      Alasql benutzt Browserschnittstellen um Daten im Local Storage zu speichern --> hier wird DB im Local Storage wird erzeugt */
  alasql('CREATE localStorage DATABASE IF NOT EXISTS db'); /** falls die DB nicht vorhanden ist --> erzeuge diese */
  alasql('ATTACH localStorage DATABASE db'); /** wird benötigt um DB im Local Storage zu speichern  */
  alasql('USE db'); /** alle SQL Befehle werden in Bezug auf die erzeugte DB ausgeführt  --> Tabelle Gehalt muss erzeugt werden s. nächste Funktion, ``multiline String um SQL sichtbarer zu schreiben */
  alasql(`CREATE TABLE IF NOT EXISTS gehalt ( 
    nummer INT PRIMARY KEY,
    age INT,
    lohnsteuerklasse INT,
    kinder BOOLEAN,
    brutto FLOAT,
    lohnsteuerbetrag FLOAT,
    kirchensteuer FLOAT,
    solidaritaetszuschlag FLOAT,
    krankenkassenbeitrag FLOAT,
    pflegeversicherung FLOAT,
    arbeitslosenversicherung FLOAT,
    rentenversicherung FLOAT,
    netto FLOAT)`
  );
}

/**
 * Delete database to remove all data
 * -- need to run createDatabase again afterwards for the functionality
 * of the app to run properly.
 * Can be used also if table data structure has been change to 
 * 
 *  the table.
 */
const deleteDatabase = function() { /** Datenbank Löschfunktion, DB ist im Local Storage, deswegen Drop localstorage, nachdem DB gelöscht wurde muss die Datenbank neu erzeugt werden  */
    // drop the DB and create it right away again
    alasql('DROP localStorage DATABASE db');
    createDatabase();
    
    // reset all fields in UI --> Alle Felder in Tabelle 1 und 2  müssen nach Löschung auf 0 gesetzt werden, nachdem alle Elemente auf 0 gesetzt wurden, wird Chart neu aufgesetzt
    document.getElementById("lsk").innerHTML = 0;
    document.getElementById("kinderValue").innerHTML = 0;
    document.getElementById("alterValue").innerHTML = 0;
    document.getElementById("bruttogehalt").innerHTML = 0;
    document.getElementById("lohnsteuerbetrag").innerHTML = 0;
    document.getElementById("kirchensteuer").innerHTML = 0;
    document.getElementById("solidaritaetszuschlag").innerHTML = 0;
    document.getElementById("krankenkassenbeitrag").innerHTML = 0;
    document.getElementById("pflegeversicherung").innerHTML = 0;
    document.getElementById("arbeitslosenversicherung").innerHTML = 0;
    document.getElementById("rentenversicherung").innerHTML = 0;
    document.getElementById("nettogehalt").innerHTML = 0;
    document.getElementById("lsk2").innerHTML = 0;
    document.getElementById("kinderValue2").innerHTML = 0;
    document.getElementById("alterValue2").innerHTML = 0;
    document.getElementById("bruttogehalt2").innerHTML = 0;
    document.getElementById("lohnsteuerbetrag2").innerHTML = 0;
    document.getElementById("kirchensteuer2").innerHTML = 0;
    document.getElementById("solidaritaetszuschlag2").innerHTML = 0;
    document.getElementById("krankenkassenbeitrag2").innerHTML = 0;
    document.getElementById("pflegeversicherung2").innerHTML = 0;
    document.getElementById("arbeitslosenversicherung2").innerHTML = 0;
    document.getElementById("rentenversicherung2").innerHTML = 0;
    document.getElementById("nettogehalt2").innerHTML = 0;
    const ctx = document.getElementById('chart').getContext("2d");
    const doughnutChart = new Chart(ctx, { /** hier wird neuer Chart erzeugt und alter Chart ersetzt --> ctx ist canvas Tag/Objekt  (oben drüber wird es definiert)*/
      type: 'doughnut',                     /** Chart.js schnittstelle zur lib */
      data: {
        datasets: [{}],
        labels: [],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        title: {
          display: true,
          text: '',
          position: 'bottom'
        }
      }
    });
    // hide comparison table
    document.getElementById('tabelle2').style.display = 'none'; /** da es keine Daten gibt, da es keinen Vergleich mehr gibt, wird Tabelle 2 unsichtbar gemacht */


}
    


/**
 * function for calculation of the Lohnsteuersatz.
 * Based on a simplified version (averages up to a salary of 6000€) from
 * http://lohnsteuertabelle.com.de/Allgemeine-Lohnsteuertabelle-Monat-2020.pdf
 */
const lohnsteuersatz = function(bruttoGehalt, lohnsteuerKlasse) {
  // check if BruttoGehalt is over 6000€. If yes, no calculation possible
  // we do not have the Lohnsteuersätze for higher salaries
  if (bruttoGehalt > 6000) {
    alert("Keine Berechnung aktuell möglich; diese App hat Information über Lohnsteuersätze bis 6000 €");
    return -1;
  }
  if (bruttoGehalt <= 1199.99) {     
    switch (lohnsteuerKlasse) {
      case 1:
      case 2:
      case 3:
      case 4:
        return 0;
      case 5:
        return 0.101;
      case 6:
        return 0.112;
    }
  }
  if (bruttoGehalt > 1199.99 && bruttoGehalt <= 1499.99) {
    switch (lohnsteuerKlasse) {
      case 1:
      case 4:
        return 0.03;
      case 2:
        return 0.012;
      case 3:
        return 0;
      case 5:
        return 0.125;
      case 6:
        return 0.135;
    }
  }
  if (bruttoGehalt > 1499.99 && bruttoGehalt <= 1999.99) {
    switch (lohnsteuerKlasse) {
      case 1:
        return 0.065;
      case 2:
        return 0.044;
      case 3:
        return 0;
      case 4:
      return 0.065;
      case 5:
        return 0.175;
      case 6:
        return 0.195;
    }
  }
  if (bruttoGehalt > 1999.99 && bruttoGehalt <= 2499.99) {
    switch (lohnsteuerKlasse) {
      case 1:
        return 0.10;
      case 2:
        return 0.082;
      case 3:
        return 0.013;
      case 4:
      return 0.10;
      case 5:
        return 0.21;
      case 6:
        return 0.227;
    }
  }
  if (bruttoGehalt > 2499.99 && bruttoGehalt <= 3499.99) {
    switch (lohnsteuerKlasse) {
      case 1:
        return 0.1335;
      case 2:
        return 0.12;
      case 3:
        return 0.05;
      case 4:
      return 0.1335;
      case 5:
        return 0.24;
      case 6:
        return 0.252;
    }
  }
  if (bruttoGehalt > 3499.99 && bruttoGehalt <= 4499.99) {
    switch (lohnsteuerKlasse) {
      case 1:
        return 0.168;
      case 2:
        return 0.155;
      case 3:
        return 0.09;
      case 4:
      return 0.168;
      case 5:
        return 0.272;
      case 6:
        return 0.277;
    }
  }
  if (bruttoGehalt > 4499.99 && bruttoGehalt <= 5499.99) {
    switch (lohnsteuerKlasse) {
      case 1:
        return 0.1975;
      case 2:
        return 0.176;
      case 3:
        return 0.12;
      case 4:
      return 0.1975;
      case 5:
        return 0.287;
      case 6:
        return 0.2945;
    }
  }
  if (bruttoGehalt > 5499.99 && bruttoGehalt <= 6000) {
    switch (lohnsteuerKlasse) {
      case 1:
        return 0.22;
      case 2:
        return 0.21;
      case 3:
        return 0.139;
      case 4:
      return 0.22;
      case 5:
        return 0.301;
      case 6:
        return 0.3065;
    }
  }
  return -1;
}

/**
 * calculate the Netto from the data given by the user
 * and store the calculated values in the database under the given record number.
 * This function is called each time the user click on the "Rechnen" or "Vergleichen" button.
 * @param {integer} nummer the id of the record where the data will be stored 
 */
function nettoBerechnen(nummer) {
      // get Bruttogehalt and Lohnsteuerklasse from HTML input fields
      const brutto = Number(document.getElementById("brutto").value);    
      const alter = Number(document.getElementById("alter").value);
      const element = document.getElementById("klasse");
      const lohnsteuerKlasse = parseInt(element.options[element.selectedIndex].value, 10); 
      const kinder = document.getElementById("kinderja").checked; /** Radiobutton - true oder false */ 

      // check if the Lohnsteuerklasse has been selected. If not, its value is 0. gibt einen Hinweis aus und macht ncihts weiteres
      if (lohnsteuerKlasse === 0) {
        alert ("Bitte, geben sie die Lohnsteuerklasse ein.")
        return;
      }

      // check if the given Bruttogehalt is a number. If not return without doing anything
      if (Number.isNaN(brutto)) { 
        alert ("Das eingegebene Bruttogehalt ist keine Zahl. Bitte, korrigieren Sie das Bruttogehalt.")
        return;
      }

      // check if the given age is an integer if not return with doing anything
      if (!Number.isInteger(alter)) {
        alert ("Das eingegebene Alter ist falsch. Bitte, korrigieren Sie das Alter.")
        return;
      }

      /**
       *  Do the calculations
       */
      
      // 1. the LohnsteuerBetrag
      // -- using the function lohnsteuersatz() defined below
      const ls = lohnsteuersatz(brutto, lohnsteuerKlasse);
      // if steuersatz could not be calculated, return without doing anything
      if (ls < 0) { return; }
      const lohnsteuerbetrag = ls * brutto;

      // 2. the Kirchensteuer
      const kirchensteuer = lohnsteuerbetrag * KIRCHENSTEUER_SATZ;

      // 3. the Solidaritätszuschlag
      const solidaritaetszuschlag = lohnsteuerbetrag * SOLI_SATZ;

      // 4. the Krankenkassenbeitrag
      // We consider 15% of Bruttogehalt and half of it is paid by the employer
      const krankenkassenbeitrag = brutto * KK_SATZ;

      // 5. the Pflegeversicherung
      // It is dependent on whether the persons have kids or are younger than 23 years old
      const pflegeversicherung = (kinder || alter <= PV_ALTER_GRENZE) ? brutto * PV_SATZ_MIT_KINDER : brutto * PV_SATZ_OHNE_KINDER;

      // 6. the Arbeitslosenversicherung
      const arbeitslosenversicherung = brutto * ARBEITSLOSENVERSICHERUNG_SATZ;
      
      // 7. the Rentenversicherung
      const rentenversicherung = brutto * RENTENVERSICHERUNG_SATZ;

      // calculating the Netto
      const netto = brutto - lohnsteuerbetrag - kirchensteuer - solidaritaetszuschlag - krankenkassenbeitrag
        - pflegeversicherung - arbeitslosenversicherung - rentenversicherung;

      // Store the data in the database, erstmal wird geprüft, ob es ein Eintrag gibt (IF EXISTS), falls ja update die DB mit den neuen Werten, falls nein werden die Werte hinzugefügt mit Insert, Durch ${...} fügt den Wert der Variable hinzu
      
      const sql = `
        IF EXISTS (SELECT * FROM gehalt WHERE nummer = ${nummer}) 
          UPDATE gehalt SET 
            age = ${alter},
            lohnsteuerklasse = ${lohnsteuerKlasse},
            kinder = ${kinder},
            brutto = ${brutto},
            lohnsteuerbetrag = ${lohnsteuerbetrag},
            kirchensteuer = ${kirchensteuer},
            solidaritaetszuschlag = ${solidaritaetszuschlag},
            krankenkassenbeitrag = ${krankenkassenbeitrag},
            pflegeversicherung = ${pflegeversicherung},
            arbeitslosenversicherung = ${arbeitslosenversicherung},
            rentenversicherung = ${rentenversicherung},
            netto = ${netto}
          WHERE nummer = ${nummer}
        ELSE
          INSERT INTO gehalt VALUES (
            ${nummer},
            ${alter},
            ${lohnsteuerKlasse},
            ${kinder},
            ${brutto},
            ${lohnsteuerbetrag},
            ${kirchensteuer},
            ${solidaritaetszuschlag},
            ${krankenkassenbeitrag},
            ${pflegeversicherung},
            ${arbeitslosenversicherung},
            ${rentenversicherung},
            ${netto}
          )
      `;
      alasql(sql); /** Befehl um Alasql Datenbank zu füllen / updaten (Schnittstelle der Library) */


}

/**
 * Calculate the Nettogehalt and store it in 
 * record number 1.
 * It also 
 * 
 * s the data of a comparison if any available.
 */
function rechnen() {
  // calculate new primary values and store them in the DB unter Nummer 1, Was soll passieren wenn Rechnen geklickt wird? Eventhandler ausführen
  nettoBerechnen(1);
  // show the data in the user interface,
  showDatafromDBInUserInterface(1);

  // show data in chart -- if comparison data is there, both datasets must be shown, gibt es 2 Datensätze mit "SELECT ... nummer = 2" ist das Array leer, oder hat einen Eintrag --> Chart muss beide zeigen oder nur einen
  const data = alasql('SELECT * FROM gehalt WHERE nummer = 2');
  const toShow = data && data.length === 1 ? 2 : 1;
  showDataInChart(toShow);
}

/**
 * Calculate the Nettogehalt and store it in 
 * record number 2.
 * It checks if data is already available in the primary record. If no data
 * is available an alert is sent and it does nothing more.
 * and stores the new data in the secondary record for comparison.
   Funktion Vergleichen --> gibt es einen ersten Wert? Select Statement auf Nummer = 1 um zu wissen, ob Nummer 1 schon da ist, wenn nicht, dann kommt ein Alert und macht nichts
   Wenn es einen Eintrag gibt, macht es weiter und macht dasselbe wie die Funktion "Rechnen" nur für Ergebnis 2, schreibt sowohl in Tabelle 1 (mit den Werten von Rechnen) und Tabelle 2 (mit den Werten von Vergleichen) und im Chart         */
function vergleichen() {
  // first check if data is already there for comparison
  const data = alasql('SELECT * FROM gehalt WHERE nummer = 1');
  if (!data || data.length === 0) {
    alert('Es gibt keine Daten zu vergleichen. Bitte, erstmal ein Nettogehalt berechnen lassen.');
    return;
  }
  // calculate new primary values and store them in the DB
  nettoBerechnen(2);
  // show the data in the user interface
  showDatafromDBInUserInterface(2);
  showDataInChart(2);
}

/**
 * 
 * 
 *  the comparison:
 *  - hide the table where the result is shown
 *  - remove the record for the comparison from the database
  Funktion Vergleichen zurücksetzen --> Vergleich wird zurückgesetzt (Tabelle 2 wird versteckt) und Chart muss neu berechnet/gerendert werden und nur Wert von Rechnen wird im Chart angezeigt  */
function resetComparison() {
  // hide table
  document.getElementById('tabelle2').style.display = 'none';
  // remove comparison data
  alasql('DELETE FROM gehalt WHERE nummer = 2');
  // re-render the chart to remove any comparison values
  showDataInChart(1);
}

/**
 * Show the data from the DB in the user interface.
 * The numbers are rounded at 2 decimals.
 * The data structure (from the DB) is the following:
 * data = {
 *  nummer
 *  age
 *  kinder
 *  lohnsteuerklasse
 *  brutto
 *  lohnsteuerbetrag
 *  kirchensteuer
 *  solidaritaetszuschlag
 *  krankenkassenbeitrag
 *  pflegeversicherung
 *  arbeitslosenversicherung
 *  rentenversicherung
 *  netto
 * } 
 Daten werden in Tabelle angezeigt. Übergeben der Records 1 oder 2 je nachdem was gezeigt werden möchte, Tabelle 1 wird aus Record 1 gefüllt, Tabelle 2 wird aus Record 2 gefüllt
 */
function showDatafromDBInUserInterface(nummer) {
  const currentData = alasql(`SELECT * FROM gehalt WHERE nummer = ${nummer}`); /** Select Statement liefert immer Array zurück */
  // show the data read from the DB in the user interface.
  // The result of the SELECT statement is an array and since we know we have one record at most
  // we take the first record found if any.
  // If no record is found, do nothing.
  if (!currentData || currentData.length < 1) {
    return; /** kein Record wurde gefunden, Funktion tut nichts */
  }
  const data = currentData[0]; /** wenn es ein Element gibt, gibt es nur eins, da Nummer Primary Key ist */ 
  

  // Display the values, wenn oben Nummer 1 --> Tabelle 1 wird gefüllt, wenn Nummer 2 --> Tabelle 2 wird gefüllt
  if (nummer === 1) {
        // fields for the primary calculation, Nach 2 Dezimalstellen wird gecuttet, Werte werden in spezifischer Tabelle angezeigt
        
    document.getElementById("lsk").innerHTML = data.lohnsteuerklasse;
    document.getElementById("kinderValue").innerHTML = data.kinder ? 'Ja' : 'Nein';
    document.getElementById("alterValue").innerHTML = data.age;
    document.getElementById("bruttogehalt").innerHTML = data.brutto.toFixed(2);
    document.getElementById("lohnsteuerbetrag").innerHTML = data.lohnsteuerbetrag.toFixed(2);
    document.getElementById("kirchensteuer").innerHTML = data.kirchensteuer.toFixed(2);
    document.getElementById("solidaritaetszuschlag").innerHTML = data.solidaritaetszuschlag.toFixed(2);
    document.getElementById("krankenkassenbeitrag").innerHTML = data.krankenkassenbeitrag.toFixed(2);
    document.getElementById("pflegeversicherung").innerHTML = data.pflegeversicherung.toFixed(2);
    document.getElementById("arbeitslosenversicherung").innerHTML = data.arbeitslosenversicherung.toFixed(2);
    document.getElementById("rentenversicherung").innerHTML = data.rentenversicherung.toFixed(2);
    document.getElementById("nettogehalt").innerHTML = data.netto.toFixed(2);
  } else if (nummer === 2) {
    // fields for the comparison
    document.getElementById("lsk2").innerHTML = data.lohnsteuerklasse;
    document.getElementById("kinderValue2").innerHTML = data.kinder ? 'Ja' : 'Nein';
    document.getElementById("alterValue2").innerHTML = data.age;
    document.getElementById("bruttogehalt2").innerHTML = data.brutto.toFixed(2);
    document.getElementById("lohnsteuerbetrag2").innerHTML = data.lohnsteuerbetrag.toFixed(2);
    document.getElementById("kirchensteuer2").innerHTML = data.kirchensteuer.toFixed(2);
    document.getElementById("solidaritaetszuschlag2").innerHTML = data.solidaritaetszuschlag.toFixed(2);
    document.getElementById("krankenkassenbeitrag2").innerHTML = data.krankenkassenbeitrag.toFixed(2);
    document.getElementById("pflegeversicherung2").innerHTML = data.pflegeversicherung.toFixed(2);
    document.getElementById("arbeitslosenversicherung2").innerHTML = data.arbeitslosenversicherung.toFixed(2);
    document.getElementById("rentenversicherung2").innerHTML = data.rentenversicherung.toFixed(2);
    document.getElementById("nettogehalt2").innerHTML = data.netto.toFixed(2);
    // show table for comparison
    /** Im Anschluss: wenn Chartdisplay false ist, wird Tabelle 2 gezeigt */
        if (!chartDisplay) {
        document.getElementById('tabelle2').style.display = 'block'; 
    }
  }  
}

/**
 * Show the data from the DB in the chart. Used for the first or second record.
 * The numbers are rounded at 2 decimals.
 * The data structure (from the DB) is the following:
 * data = {
 *  nummer
 *  age
 *  kinder
 *  lohnsteuerklasse
 *  brutto
 *  lohnsteuerbetrag
 *  kirchensteuer
 *  solidaritaetszuschlag
 *  krankenkassenbeitrag
 *  pflegeversicherung
 *  arbeitslosenversicherung
 *  rentenversicherung
 *  netto
 * } 
 Möchte ich Record 1 anzeigen oder Record 1 und 2? + Reihenfolge definieren --> 1. Eintrag im Array = 1. Eintrag in Tabelle*/
function showDataInChart(nummer) {
  const currentData = nummer === 1 
    ? alasql(`SELECT * FROM gehalt WHERE nummer = 1`)
    : alasql(`SELECT * FROM gehalt WHERE nummer = 1 OR nummer = 2 ORDER BY nummer`);
  // show the data read from the DB in the user interface.
  // The result of the SELECT statement is an array and since we know we have one record at most
  // we take the first record found if any.
  // If no record is found, do nothing.
  if (!currentData || currentData.length < 1) {
    return;
  }
  const inputData = currentData[0]; /** Gibt es einen 2. Eintrag im Array? Wert wird geholt um in Chart zu setzen.  */
  const comparisonData = (nummer === 2 && currentData.length === 2) ? currentData[1] : null;

  /** Konfiguration für den Chart, Labels müssen berechnet werden, Farben müssen aufgeführt werden usw. 
   * Was benötigt Chart.js um die Charts anzuzeigen? Chart.js Dokumentation anschauen!!
   * Keys: Werte, die man im Chart anzeigen lassen möchte von der Datenbank
   * Arrays der Lables, Werte, Vergleichwerte werden gebaut
   * Key.forEach: Iteriert über alle Keys und wird für jeden Key ausgeführt
   * Values: inputData --> Alle berechneten Daten aus der Datenbank "Lohnsteuerbetrag, Kirchensteuer usw usw"
   * Comparisondata: Wenn es ein Objekt ist und Werte für den Vergleich enthält, werden die Werte in der Reihenfolge (Lohnsteuerbetrag, Kirchensteuer usw) im Array eingefügt, falls null ist, wird nichts gemacht
   * Dataset Array: Farbinformationen für den Chart --> Farbreihenfolge immer gleich hard codiert--> Kirchensteuer wird bspw. immer Lila sein 
   * 
  */
  const keys = [
    'lohnsteuerbetrag',
    'kirchensteuer',
    'solidaritaetszuschlag',
    'krankenkassenbeitrag',
    'pflegeversicherung',
    'arbeitslosenversicherung',
    'rentenversicherung',
    'netto',
  ];
  let labels = [];
  let values = [];
  let comparisonValues = [];
  keys.forEach(key => {
    labels.push(capitalize(key));
    values.push(inputData[key].toFixed(2));
    if (comparisonData) {
      comparisonValues.push(comparisonData[key].toFixed(2))
    }
  });
  const dataSets = [];
  dataSets.push({
    data: values,
    backgroundColor:[
      'rgb(255, 99, 132)',
      'rgb(255, 159, 64)',
      'rgb(255, 205, 86)',
      'rgb(70, 140, 140)',
      'rgb(75, 192, 192)',
      'rgb(40, 142, 205)',
      'rgb(153, 102, 255)',
      'rgb(100, 100, 100)'
    ]
  });
  if (comparisonData) {
    dataSets.push({
      data: comparisonValues,
      backgroundColor:[
        'rgb(255, 99, 132)',
        'rgb(255, 159, 64)',
        'rgb(255, 205, 86)',
        'rgb(70, 140, 140)',
        'rgb(75, 192, 192)',
        'rgb(40, 142, 205)',
        'rgb(153, 102, 255)',
        'rgb(100, 100, 100)'
      ]
    });
  }

  // feeding the data into the chart
  const ctx = document.getElementById('chart').getContext("2d");
  const doughnutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: dataSets,
      labels: labels,
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      title: {
        display: true,
        text: nummer === 2 ? `Vergleichswerte sind im inneren Kreis.` : '',
        position: 'bottom'
      }
    }
  });
}


/**
 * helper function to capitalize the first letter of a string
 * (use the table field names as german words to simplify display)
 */
const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/**
 * function to show the HTML element containing the chart and hide the data --> Element Graph anzeigen wenn man drückt, Tabelle wird versteckt
 */
function showChart() {
  document.getElementById('tabelle').style.display = 'none';
  document.getElementById('tabelle2').style.display = 'none';
  document.getElementById('chartDiv').style.display = 'block';
  chartDisplay = true;
}

/**
 * function to show the HTML element containing the data and hide the chart --> Element Tabelle anzeigen, wenn gedrückt wird
 * Soll 1 oder 2 Tabelle dargestellt werden? Gibt es 2 Einträge? Wenn ja wird Tabelle 1 und 2 angezeigt, wenn 2. Record in Datenbank nicht gefüllt, wird nur Tabelle 1 angezeigt
 */
function showData() {
  const isComparison = alasql(`SELECT * FROM gehalt WHERE nummer = 2`);
  const showTabelle2 = isComparison && isComparison.length === 1;
  document.getElementById('chartDiv').style.display = 'none';
  document.getElementById('tabelle').style.display = 'block';
  if (showTabelle2) {
    document.getElementById('tabelle2').style.display = 'block';
  }
  chartDisplay = false;
}
