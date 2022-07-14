// @ts-nocheck
import { ModularAddition } from "./class.ModularAddition";
import $ from "jquery";
import moment from "moment";

// eslint-disable-next-line @typescript-eslint/no-namespace
module CertStat {
  "use strict";

  export class DeliveryDetails extends ModularAddition {
    examDetails: ExamDetails;

    mandatory: Boolean;
    invalid = false;

    constructor(
      inputForm: JQuery,
      displayList: JQuery,
      examDetails: ExamDetails,
      isArray: boolean = false
    ) {
      super(inputForm, displayList, isArray);

      var self = this;

      self.examDetails = examDetails;
      self.mandatory = true;

      self.addButton.on("click", function (e) {
        e.preventDefault();
        self.addDetail();
      });

      $("#fastTrack_option").on("click", function () {
        $(".authenticated").toggle();
        $('[data-key="authenticatedCount"]').text(0);

        var deliveryMethodEl = $("#trackedDelivery"),
          elTenantVal = deliveryMethodEl.attr("data-tenant"),
          countryCode =
            $("#delivery_details_country option:selected").attr("data-code") ||
            "0";

        if (elTenantVal == "ocr") {
          if (countryCode == "44") {
            if ($(this).is(":checked")) {
              deliveryMethodEl.val("true");
              deliveryMethodEl.prop("disabled", true);
            } else {
              deliveryMethodEl.prop("disabled", false);
              deliveryMethodEl.val("false");
            }
            deliveryMethodEl.trigger("change");
          }

          // Update added delivery detail

          var dL,
            dList = self.detailList,
            dlLength = self.detailList.length;
          for (dL = 0; dL < dlLength; dL++) {
            var detail = dList[dL].data;

            var display = $(self.displayList)
              .find("article:eq(" + dL + ")")
              .find('li:contains("Delivery method")')
              .find(".input");

            if (detail.iddPrefix == "44") {
              if ($(this).is(":checked")) {
                dList[dL].data.trackedDelivery = true;

                dList[dL].display["Delivery method"] =
                  "Special Delivery (traceable)";
                $(display).text("Special Delivery (traceable)");
              } else {
                dList[dL].data.trackedDelivery = false;

                dList[dL].display["Delivery method"] =
                  "First Class (non-traceable)";
                $(display).text("First Class (non-traceable)");
              }
            }
          }
        }
      });

      // monitor contry list!
      $('[name="country"]', inputForm)
        .on("change", function () {
          // Require tax id depending on value of country

          var country = $(this).val();
          var requiredTax = ["Argentina", "Brazil", "Chile", "Ecuador"];
          if (requiredTax.indexOf(country) > -1) {
            $("#delivery-details-tax-id-container")
              .find("label")
              .attr("data-required", "true");
          } else {
            $("#delivery-details-tax-id-container")
              .find("label")
              .attr("data-required", "false");
          }

          self.parseCountry($(this));
        })
        .trigger("change");

      if (examDetails) {
        // monitor changes to exam details

        self.examDetails.triggers.push(function (
          action: string,
          md: ModularDetail
        ) {
          self.modifyMDs(action, md);
        });
      }
    }

    modifyMDs(action: string, md: ModularDetail) {
      var self = this;

      var dL,
        details,
        dlLength = self.displayList.length,
        markup;
      for (dL = 0; dL < dlLength; dL++) {
        details = $(self.displayList[dL]);

        switch (action) {
          case "add":
            {
              // add the md to the list
              if (
                details.find(
                  '[data-key="customSeriesSelection"] tbody tr.empty'
                ).length > 0
              ) {
                details
                  .find('[data-key="customSeriesSelection"] tbody tr.empty')
                  .remove();
              }
              markup = self.generateMDTR(md);
              details
                .find('[data-key="customSeriesSelection"] tbody')
                .append(markup);
            }
            break;

          case "delete":
            {
              // look for elements with id of md's id and remove them
              if (details.find('[data-id="' + md.id + '"]').length > 0) {
                details.find('[data-id="' + md.id + '"]').remove();
                if (
                  details.find('[data-key="customSeriesSelection"] tbody tr')
                    .length === 0
                ) {
                  // add empty list item
                  details
                    .find('[data-key="customSeriesSelection"] tbody')
                    .append(
                      '<tr class="empty"><td colspan="5"><em>No exam series specified yet.</em></td></tr>'
                    );
                }
              }
            }
            break;
        }
      }
    }

    generateMDTR(md: ModularDetail) {
      var exam: any = md.rawData;

      var html = '<tr data-id="' + md.id + '">';
      html +=
        '<td data-key="series">' +
        exam.qualification +
        " in " +
        exam.month +
        " " +
        exam.year +
        "</td>";
      html +=
        '<td class="small" data-key="candidate">' +
        exam.candidateNumber +
        "</td>";
      html += '<td data-key="centre">' + exam.centreName + "</td>";
      html += '<td class="option_counter" data-key="statements">';
      html +=
        '<a data-key="statements" title="Remove certifying statement" data-trigger="minus" href="#">&#8722;</a>';
      html += ' <span data-key="statementCount">0</span> ';
      html +=
        '<a data-key="statements" title="Add certifying statement" data-trigger="plus" href="#">&#43;</a>';
      html += "</td>";
      html +=
        '<td class="option_counter authenticated" title="Authenticated Statements incur additional costs." data-key="authenticated">';
      html +=
        '<a data-key="authenticated" title="Remove authenticated statement" data-trigger="minus" href="#">&#8722;</a>';
      html += ' <span data-key="authenticatedCount">0</span> ';
      html +=
        '<a title="Add authenticated statement" data-key="authenticated" data-trigger="plus" href="#">&#43;</a>';
      html += "</td>";
      html += "</tr>";

      var el = $(html);

      el.find(".option_counter a").on("click", function (e) {
        e.preventDefault();

        // parse object data

        var count = parseInt(
          $(this)
            .siblings(
              '[data-key="statementCount"], [data-key="authenticatedCount"]'
            )
            .text(),
          10
        );

        switch ($(this).attr("data-trigger")) {
          case "plus":
            {
              // deal with adding new copy

              if ($(this).attr("data-key") === "statements") {
                $(this)
                  .siblings('[data-key="statementCount"]')
                  .text(count + 1);
              } else {
                $(this)
                  .siblings('[data-key="authenticatedCount"]')
                  .text(count + 1);
              }
            }
            break;

          case "minus":
            {
              // deal with removing copy

              if (
                $(this).attr("data-key") === "authenticated" &&
                count - 1 >= 0
              ) {
                $(this)
                  .siblings('[data-key="authenticatedCount"]')
                  .text(count - 1);
              } else {
                if (count - 1 >= 0)
                  $(this)
                    .siblings('[data-key="statementCount"]')
                    .text(count - 1);
              }
            }
            break;
        }
      });

      return el;
    }

    parseCountry(item: JQuery) {
      // change delivery method based on country.
      var countryCode = $("option:selected", item).attr("data-code") || "0",
        deliveryMethodEl = $("#trackedDelivery"),
        elTenantVal = deliveryMethodEl.attr("data-tenant"),
        elFalseVal = deliveryMethodEl.find("option[value=false]"),
        elTrueVal = deliveryMethodEl.find("option[value=true]"),
        fastTrackTrueVal = $("#fastTrack_option").is(":checked");

      switch (elTenantVal) {
        case "ocr":
          countryCode == "44"
            ? elFalseVal
                .text("First Class (non-traceable)")
                .prop("selected", true)
            : elFalseVal.text("Airmail (non-traceable)");
          countryCode == "44"
            ? elTrueVal.text("Special Delivery (traceable)")
            : elTrueVal.text("Courier (traceable)").prop("selected", true);
          if (countryCode == "44") {
            deliveryMethodEl.prop("disabled", false);
            if (fastTrackTrueVal) {
              deliveryMethodEl.val("true");
              deliveryMethodEl.prop("disabled", true);
            }
          } else {
            deliveryMethodEl.prop("disabled", true);
          }
          break;
        case "ce":
          deliveryMethodEl.prop("disabled", true);
          countryCode == "44"
            ? elFalseVal.text("First Class (non-traceable)")
            : elFalseVal.text("Airmail (non-traceable)");
          countryCode == "44"
            ? elTrueVal
                .text("Special Delivery (traceable)")
                .prop("selected", true)
            : elTrueVal.text("Courier (traceable)").prop("selected", true);
          break;
        default:
          countryCode == "44"
            ? elFalseVal.text("First Class (non-traceable)")
            : elFalseVal.text("Airmail (non-traceable)");
          countryCode == "44"
            ? elTrueVal
                .text("Special Delivery (traceable)")
                .prop("selected", true)
            : elTrueVal.text("Courier (traceable)").prop("selected", true);
          break;
      }

      deliveryMethodEl.trigger("change");
    }

    addDetail() {
      this.resetFieldValidations();

      var self = this,
        display: any = {},
        results: any = {},
        rawResults: any = {},
        f,
        fieldLen = this.fields.length,
        field,
        missing = [],
        error = [];

      for (f = 0; f < fieldLen; f++) {
        field = this.fields[f];

        results[field.name] = ModularAddition.htmlEncode(field.value);

        rawResults[field.name] = ModularAddition.htmlEncode(field.rawValue);

        display[field.name] = ModularAddition.htmlEncode(field.displayName);

        if (field.type === "option") {
          field.element.parents(".input:first").addClass("missing");
          field.element.parents(".input:first").addClass("error");
        } else {
          field.element.removeClass("missing");
          field.element.removeClass("error");
        }

        if (field.missing && field.required) missing.push(field);
        if (field.error) error.push(field);
      }

      var displayResults = {
        "Name of recipient": results.fullName,
        "Job title of recipient": results.jobTitle,
        "Recipient address":
          results.addressLines.join("<br>") +
          (results.addressLine2 ? "<br>" + results.addressLine2 : "") +
          (results.city ? "<br>" + results.city : "") +
          (results.state ? "<br>" + results.state : "") +
          "<br>" +
          results.postcode +
          "<br>" +
          results.country,
        "Recipient phone number": results.iddPrefix + " " + results.phoneNumber,
        "Alternative phone number":
          results.altPhoneNumber == ""
            ? "-"
            : results.altIddPrefix + " " + results.altPhoneNumber,
        "Tax ID": $("#delivery_details_tax_id").length
          ? results.taxId
          : undefined,
        "Delivery method": display.trackedDelivery,
        "Extra notes":
          "<em>" + results.notes.replace(/(?:\r\n|\r|\n)/g, "<br>") + "</em>",
        "Reference Number": results.recipientReference
      };

      if (missing.length > 0 || error.length > 0) {
        // alert user of error
        fieldLen = missing.length;
        for (f = 0; f < fieldLen; f++) {
          field = missing[f];
          if (field.inputType === "option") {
            field.element.parents(".input:first").addClass("missing");
          } else {
            field.element.addClass("missing");
          }
        }
        fieldLen = error.length;
        for (f = 0; f < fieldLen; f++) {
          field = error[f];
          if (field.inputType === "option") {
            field.element.parents(".input:first").addClass("error");
          } else {
            field.element.addClass("error");
          }
        }
        if (missing.length > 0) {
          $(document).scrollTop(missing[0].element.offset().top);
        } else {
          $(document).scrollTop(error[0].element.offset().top);
        }
      } else {
        // add new modular detail

        var MD = new ModularDetail(results, displayResults, rawResults, this);
        var MDUI = MD.getUI();

        // add details for listening to new search series
        MDUI = self.addCustomUI(MDUI);

        this.displayList.append(MDUI);

        this.detailList.push(MD);

        this.clearFields();

        $("#fastTrack_option").is(":checked")
          ? $(".authenticated").hide()
          : $(".authenticated").show();

        // remove group error message

        this.inputForm
          .closest("fieldset")
          .find("p[data-rel=mandatory]")
          .addClass("hidden");
      }
    }

    editData(id: string) {
      this.editDetails(id);
    }

    deleteData(id: string) {
      this.deleteDetails(id);
    }

    addCustomUI(MDUI: JQuery) {
      var self = this;
      // go looking through exam details..  .
      var markup = $(
        '<ul class="modular_details_list delivery_details_series_options"></ul>'
      );
      // add item for: one copy of each to this address
      var rand: string = parseInt(Math.random() * 100000 + "", 10).toString();
      markup.append(
        '<li class="selected"><input id="delivery_series_option_oneEach_' +
          rand +
          '" type="radio" checked="checked" name="send_copies_' +
          rand +
          '" value="oneEach" /><label for="delivery_series_option_oneEach_' +
          rand +
          '">Send one certifying statement of all examination series to this address</label></li>'
      );
      // now set area where exam series details will be displayed...
      var table = $(
        '<table data-key="customSeriesSelection"><thead>\
                    <tr>\
                      <td>Exam Series</td>\
                      <td class="small">Candidate Number</td>\
                      <td>Centre Name</td>\
                      <td class="option_counter">Certifying Statements</td>\
                      <td title="Authenticated Statements incur additional costs." class="option_counter authenticated">Authenticated Certifying Statements</td>\
                    </tr>\
                  </thead><tbody></tbody></table>'
      );
      // now add info into the customSeriesSelection table...
      var es,
        examSeries = self.examDetails.detailList,
        esCount = examSeries.length,
        selectedExamSeries,
        esRow;
      for (es = 0; es < esCount; es++) {
        esRow = self.generateMDTR(examSeries[es]);
        $("tbody", table).append(esRow);
      }

      if ($("tbody tr", table).length === 0) {
        // no rows!
        $("tbody", table).append(
          '<tr class="empty"><td colspan="5"><em>No exam series specified yet.</em></td></tr>'
        );
      }

      markup.append(
        '<li class="custom_selection"><input id="delivery_series_option_custom_' +
          rand +
          '" type="radio" name="send_copies_' +
          rand +
          '" value="custom" /><label for="delivery_series_option_custom_' +
          rand +
          '">Specify delivery instructions for more than one certifying statement<span class="authenticated"> or request authenticated certifying statements</span>:</label></li>'
      );
      markup.find(".custom_selection").append(table);

      // now listen for the radio input change event and add / remove the selected class
      markup.find('input[type="radio"]').on("change", function () {
        $(this)
          .parents("li:first")
          .addClass("selected")
          .siblings()
          .removeClass("selected");
      });
      markup.find(">li").on("click", function () {
        $(this).find("input:first").prop("checked", true).trigger("change");
      });

      // add the new markup to the ModularDetails element
      MDUI.find("main").append(markup);
      return MDUI;
    }

    update() {
      // parse copy details into detail list data

      var detailList = this.detailList,
        detail,
        dl,
        dlLen = detailList.length,
        list,
        listOption,
        searches,
        searchList,
        s,
        search,
        nonZero,
        searchCount = 0,
        zeroSearchCount = 0;

      var deletedSearchCountsById: number[] = [];

      for (dl = 0; dl < dlLen; dl++) {
        detail = detailList[dl];

        detail.__error = false;
        searchCount = 0;
        zeroSearchCount = 0;
        searchList = {};

        // get list option

        list = this.displayList.find('[data-id="' + detail.id + '"]');

        if (list.find('input[type="radio"]:checked').val() === "oneEach") {
          // set up one each
          list.find("tbody tr:not(.empty)").each(function () {
            searchList[$(this).attr("data-id")] = {
              statements: 1,
              authenticated: 0
            };
          });
        } else {
          // sort out custom list
          list.find("tbody tr:not(.empty)").each(function () {
            searchList[$(this).attr("data-id")] = {
              statements: parseInt(
                $(this).find('[data-key="statementCount"]').text(),
                10
              ),
              authenticated: parseInt(
                $(this).find('[data-key="authenticatedCount"]').text(),
                10
              )
            };

            searchList[$(this).attr("data-id")].statements +=
              searchList[$(this).attr("data-id")].authenticated;
          });
        }

        // remove searches without any assignments
        for (s in searchList) {
          searchCount++;
          nonZero = false;
          search = searchList[s];

          if (search.statements > 0) nonZero = true;

          if (search.authenticated > 0) nonZero = true;
          if (!nonZero) {
            // remove this search!
            delete searchList[s];
            zeroSearchCount++;

            deletedSearchCountsById[s] =
              deletedSearchCountsById[s] == undefined
                ? 1
                : deletedSearchCountsById[s] + 1;
          }
        }

        // assign as searches object

        detail.data.searches = searchList;

        // detect if recipient has anything being sent to them
        if (searchCount === zeroSearchCount) {
          // don't include it in data

          detail.__error = true;
        }
      }

      this.invalid = false;
      for (s in deletedSearchCountsById) {
        if (deletedSearchCountsById[s] == dlLen) {
          // This particular search has been deleted out of every recipient's searches, which means there are no orders for it.
          this.invalid = true;
          // As searches with no orders cause problems further down the line, mark the order as invalid.
          break;
        }
      }
    }
  }
}

export default CertStat;
