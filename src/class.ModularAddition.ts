// @ts-nocheck
import $ from "jquery";
import moment from "moment";

// eslint-disable-next-line @typescript-eslint/no-namespace
module CertStat {
  "use strict";

  export enum AsyncStatus {
    "WAIT",
    "PROCESSING",
    "COMPLETE"
  }

  export class ModularAddition {
    fields = Array<MonitorElement>();

    addButton: JQuery;

    detailList = Array<ModularDetail>();

    displayList: JQuery;

    inputForm: JQuery;

    isArray: boolean;

    constructor(
      inputForm: JQuery,
      displayList: JQuery,
      isArray: boolean = false
    ) {
      var self = this,
        // parse fields
        fields = inputForm.find('input[type="text"], textarea, select');

      self.isArray = isArray;

      fields.each(function () {
        var monitoredElement = new MonitorElement($(this)),
          label = inputForm.find('label[for="' + $(this).attr("id") + '"]');
        if (label.attr("data-required") === "true") {
          monitoredElement.required = true;

          $(this).addClass("required_element");
        }
        self.fields.push(monitoredElement);
      });

      // deal with checkboxes and radios!
      var checkboxes = {};
      inputForm
        .find('input[type="checkbox"], input[type="radio"]')
        .each(function () {
          if (!checkboxes[$(this).attr("name")])
            checkboxes[$(this).attr("name")] = inputForm.find(
              'input[name="' + $(this).attr("name") + '"]'
            );
        });
      var c, monitoredElement, label;
      for (c in checkboxes) {
        monitoredElement = new MonitorElement(checkboxes[c]);

        label = checkboxes[c].parent().prevAll(".label");
        if (label.attr("data-required") === "true") {
          monitoredElement.required = true;
        }
        self.fields.push(monitoredElement);
      }

      self.inputForm = inputForm;
      self.displayList = displayList;
      self.addButton = inputForm.find('input[type="button"]');
      self.addButton.on("click", function () {
        self.inputForm.find(".missing_error").addClass("hidden");
      });
    }

    resetFieldValidations() {
      var self = this,
        fields = self.inputForm.find('input[type="text"], textarea, select');

      self.fields = Array<MonitorElement>();

      fields.each(function () {
        var monitoredElement = new MonitorElement($(this)),
          label = self.inputForm.find(
            'label[for="' + $(this).attr("id") + '"]'
          );
        if (label.attr("data-required") === "true") {
          monitoredElement.required = true;

          $(this).addClass("required_element");
        }
        self.fields.push(monitoredElement);
      });

      // deal with checkboxes and radios!
      var checkboxes = {};
      self.inputForm
        .find('input[type="checkbox"], input[type="radio"]')
        .each(function () {
          if (!checkboxes[$(this).attr("name")])
            checkboxes[$(this).attr("name")] = self.inputForm.find(
              'input[name="' + $(this).attr("name") + '"]'
            );
        });
      var c, monitoredElement, label;
      for (c in checkboxes) {
        monitoredElement = new MonitorElement(checkboxes[c]);

        label = checkboxes[c].parent().prevAll(".label");
        if (label.attr("data-required") === "true") {
          monitoredElement.required = true;
        }
        self.fields.push(monitoredElement);
      }
    }

    clearFields() {
      var self = this,
        // reset field ui
        f,
        fieldLen = self.fields.length,
        field;

      for (f = 0; f < fieldLen; f++) {
        field = self.fields[f];

        if (field.name == "fastTrack") {
          continue;
        }

        if (field.element.attr("type") === "checkbox") {
          field.element.prop("checked", false).trigger("change");
        } else if (field.element.attr("type") === "radio") {
          field.element.prop("checked", false).trigger("change");
        } else if (field.element.prop("tagName") === "SELECT") {
          field.element
            .find("option:first")
            .prop("selected", true)
            .trigger("change");
        } else {
          field.element.val("").trigger("change");
        }
      }
    }

    editDetails(id: string) {
      var MD,
        md,
        mdLen = this.detailList.length;
      for (md = 0; md < mdLen; md++) {
        MD = this.detailList[md];
        if (MD.id === id) {
          //console.log('Found it!', MD);
          break;
        }
      }

      // put the data into the ui
      var f,
        field,
        me,
        modElem,
        meLen = this.fields.length;

      for (f in MD.rawData) {
        field = MD.rawData[f];
        for (me = 0; me < meLen; me++) {
          modElem = this.fields[me];
          if (modElem.name === f) {
            // deal with radios and checkboxes
            if (
              modElem.element.attr("type") === "checkbox" ||
              modElem.element.attr("type") === "radio"
            ) {
              modElem.element.prop("checked", false);
              modElem.element
                .filter('[value="' + field + '"]')
                .prop("checked", true)
                .trigger("change");
            } else {
              modElem.element.val(field).trigger("change");
            }

            break;
          }
        }
      }
      try {
        $(document).scrollTop(this.fields[0].element.offset().top);
      } catch (e) {}
      // delete data ready for re-insertion
      this.deleteDetails(id);
    }

    deleteDetails(id: string) {
      var MD,
        md,
        mdLen = this.detailList.length,
        index;
      for (md = 0; md < mdLen; md++) {
        MD = this.detailList[md];
        if (MD.id === id) {
          index = md;
          break;
        }
      }
      // remove item from list

      this.detailList.splice(index, 1);
      // remove item from UI
      this.displayList.find('[data-id="' + id + '"]').remove();
    }

    static htmlEncode(riskyText: any): any {
      if (
        (Array.isArray && Array.isArray(riskyText)) ||
        (!Array.isArray &&
          Object.prototype.toString.call(riskyText) === "[object Array]")
      ) {
        var result: Array<string> = [];
        for (var i = 0; i < riskyText.length; i++) {
          result.push(ModularAddition.htmlEncode(riskyText[i]));
        }
        return result;
      } else if (typeof riskyText === "string") {
        return $("<div>").text(riskyText).html();
      } else {
        return riskyText;
      }
    }
  }
}
