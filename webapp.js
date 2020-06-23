
/**
 * WebApp functions. Requires 'alasql' and 'Chart.js'.
 */

/**
 * variable to toggle view of chart vs view of tables
 */
let chartDisplay = false;

/**
 *  constant values used for the calculations
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
const createDatabase = function() {
  alasql('CREATE localStorage DATABASE IF NOT EXISTS db');
  alasql('ATTACH localStorage DATABASE db');
  alasql('USE db');
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
const deleteDatabase = function() {
    // drop the DB and create it right away again
    alasql('DROP localStorage DATABASE db');
    createDatabase();
    
    // reset all fields in UI
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
    const doughnutChart = new Chart(ctx, {
      type: 'doughnut',
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
    document.getElementById('tabelle2').style.display = 'none';


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
      const kinder = document.getElementById("kinderja").checked;

      // check if the Lohnsteuerklasse has been selected. If not, its value is 0.
      if (lohnsteuerKlasse === 0) {
        alert ("Bitte, geben sie die Lohnsteuerklasse ein.")
        return;
      }

      // check if the given Bruttogehalt is a number. If not return without doing anything
      if (Number.isNaN(brutto)) {
        alert ("Das eingegebene Bruttogehalt ist keine Zahl. Bitte, korrigieren Sie das Bruttogehalt.")
        return;
      }

      // check if the given age is an integer
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

      // Store the data in the database
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
      alasql(sql);


}

/**
 * Calculate the Nettogehalt and store it in 
 * record number 1.
 * It also 
 * 
 * s the data of a comparison if any available.
 */
function rechnen() {
  // calculate new primary values and store them in the DB
  nettoBerechnen(1);
  // show the data in the user interface
  showDatafromDBInUserInterface(1);

  // show data in chart -- if comparison data is there, both datasets must be shown
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
 */
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
 */
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
 */
function showDatafromDBInUserInterface(nummer) {
  const currentData = alasql(`SELECT * FROM gehalt WHERE nummer = ${nummer}`);
  // show the data read from the DB in the user interface.
  // The result of the SELECT statement is an array and since we know we have one record at most
  // we take the first record found if any.
  // If no record is found, do nothing.
  if (!currentData || currentData.length < 1) {
    return;
  }
  const data = currentData[0];
  console.log('nummer, data', nummer, data);

  // Display the values
  if (nummer === 1) {
    console.log('data', data);
    // fields for the primary calculation
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
 */
function showDataInChart(nummer) {
  const currentData = nummer === 1 
    ? alasql(`SELECT * FROM gehalt WHERE nummer = 1`)
    : alasql(`SELECT * FROM gehalt WHERE nummer = 1 OR nummer = 2`);
  // show the data read from the DB in the user interface.
  // The result of the SELECT statement is an array and since we know we have one record at most
  // we take the first record found if any.
  // If no record is found, do nothing.
  if (!currentData || currentData.length < 1) {
    return;
  }
  const inputData = currentData[0];
  const comparisonData = nummer === 2 && currentData[1] ? currentData[1] : null;

  console.log('nummer, inputData', nummer, inputData);
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
 * function to show the HTML element containing the chart and hide the data
 */
function showChart() {
  document.getElementById('tabelle').style.display = 'none';
  document.getElementById('tabelle2').style.display = 'none';
  document.getElementById('chartDiv').style.display = 'block';
  chartDisplay = true;
}

/**
 * function to show the HTML element containing the data and hide the chart 
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
