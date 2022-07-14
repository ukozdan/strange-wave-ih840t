import { v4 as uuidv4 } from "uuid";
import "./styles.css";

/*document.getElementById("app").innerHTML = `
<h1>Hello Vanilla!</h1>
<div>
  We use the same configuration as Parcel to bundle this sandbox, you can find more
  info about Parcel 
  <a href="https://parceljs.org" target="_blank" rel="noopener noreferrer">here</a>.
</div>`;*/

//------------------------------------------------------------

const CertStat = () => {
  let businessStream: string = "ocr";
  let fastTrackVisible: boolean = true;
  let fastTrackChecked: boolean = false;
  let trackedDeliveryEnabled: boolean = true;

  let handleYears = () => {
    let years: { id: string; year: number; edit: boolean }[] = [];

    let addYear = (id: string, newYear: number, edit: boolean) => {
      let index: number = years.findIndex((object) => {
        return object.edit === true;
      });

      if (years.length !== 0) {
        if (index > -1) {
          years[index].id = id;
          years[index].year = newYear;
          years[index].edit = false;
        } else if (index === -1) {
          years.push({ id: id, year: newYear, edit: edit });
        }
      } else {
        years.push({ id: id, year: newYear, edit: edit });
      }
    };

    let deleteYear = (id: string) => {
      const index: number = years.findIndex((x) => x.id === id);

      years.splice(index, 1);
      // reset form
    };

    let editYear = (id: string) => {
      let foundIndex: number = years.findIndex((x) => x.id === id);

      if (years[foundIndex].id === id) {
        years[foundIndex].edit = true;
      } else {
        //console.log("editYear(): id does not exist in years array.");
      }
    };

    let calculateMaxYear = () => {
      const yearsOnly: number[] = [];

      for (let i of years) {
        yearsOnly.push(i.year);
      }

      if (yearsOnly.length > 0) {
        return Math.max(...yearsOnly);
      } else {
        return 0;
      }
    };

    let getYears = () => {
      return years;
    };

    return {
      getYears: getYears,
      addYear: addYear,
      deleteYear: deleteYear,
      editYear: editYear,
      calculateMaxYear: calculateMaxYear
    };
  };

  let newHandleYears = handleYears();

  let fastTrackAddYear = (id: string) => {
    if (businessStream === "ocr") {
      let selectedYear: number = 1999;

      newHandleYears.addYear(id, selectedYear, false);

      let seriesYearMax: number = newHandleYears.calculateMaxYear();

      if (seriesYearMax < 2000 && fastTrackVisible === true) {
        fastTrackVisible = false;
        fastTrackChecked = false;
        trackedDeliveryEnabled = true;
      } else if (seriesYearMax > 1999 && fastTrackVisible === false) {
        fastTrackVisible = true;
      }
    }
  };

  let fastTrackDeleteYear = (id: string) => {
    newHandleYears.deleteYear(id);

    let seriesYearMax: number = newHandleYears.calculateMaxYear();

    if (seriesYearMax < 2000) {
      fastTrackVisible = false;
    } else if (seriesYearMax > 1999 && fastTrackVisible === false) {
      fastTrackVisible = true;
    }
  };

  let fastTrackEditYear = (id: string) => {
    newHandleYears.editYear(id);
  };
};

export default CertStat;

//------------------------------------------------------------
