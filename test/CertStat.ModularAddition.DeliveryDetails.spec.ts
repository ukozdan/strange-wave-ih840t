// @ts-nocheck
import { CertStat } from "../src/class.ModularAddition.DeliveryDetails";
import $ from "jquery";

const madge = require("madge");

madge("../src/CertStat.ModularAddition.DeliveryDetails.ts").then((res) => {
  console.log(res.circularGraph());
});

describe("CertStat.DeliveryDetails", function () {
  it("should be exposed", function () {
    expect(CertStat.DeliveryDetails).toBeDefined();
  });

  it("should inherit the functions of CertStat.ModularAddition", function () {
    var DD = new CertStat.DeliveryDetails($("<div>"), $("<div>"));
    expect(DD.clearFields).toBeDefined();
  });

  describe("__constructor()", function () {
    var DD, form;
    beforeEach(function () {
      form = $('<div><input type="button" name="country"></div>');
      DD = new CertStat.DeliveryDetails(form, $("<div>"));
    });
    afterEach(function () {
      form = undefined;
      DD = undefined;
    });

    it("should monitor the add button and call .addDetail() when triggered", function () {
      jest.spyOn(DD, "addDetail");
      $("input", form).trigger("click");
      expect(DD.addDetail).toHaveBeenCalled();
    });

    it("should try and parse the country ISTD code for the selected country", function () {
      jest.spyOn(DD, "parseCountry");
      $("input", form).trigger("change");
      expect(DD.parseCountry).toHaveBeenCalled();
    });

    it("should monitor changes to exam details", function () {
      var ED = { triggers: [] },
        MD = {};
      DD = new CertStat.DeliveryDetails(form, $("<div>"), ED);
      expect(ED.triggers.length).toBe(1);
      jest.spyOn(DD, "modifyMDs");
      ED.triggers[0].call(ED, "test", MD);
      expect(DD.modifyMDs).toHaveBeenCalled();
      expect(DD.modifyMDs.calls.mostRecent().args[0]).toBe("test");
      expect(DD.modifyMDs.calls.mostRecent().args[1]).toBe(MD);
    });
  });

  describe(".modifyMDs()", function () {
    var DD, form;
    beforeEach(function () {
      form = $('<div><input type="button" name="country"></div>');
      DD = new CertStat.DeliveryDetails(
        form,
        $(
          '<div><table data-key="customSeriesSelection"><tbody><tr class="empty"><td>No exams</td></tr></tbody></table></div>'
        )
      );
    });
    afterEach(function () {
      form = undefined;
      DD = undefined;
    });

    it("should call .generateMDTR() to generate the markup", function () {
      jest.spyOn(DD, "generateMDTR");
      DD.modifyMDs("add", {});
      expect(DD.generateMDTR).toHaveBeenCalled();
    });

    it('should remove the "no exams" empty cell', function () {
      expect(DD.displayList.find("tr.empty").length).toBe(1);
      jest.spyOn(DD, "generateMDTR").and.returnValue("");
      DD.modifyMDs("add", {});
      expect(DD.displayList.find("tr.empty").length).toBe(0);
    });

    it("should add an entry to the exam list", function () {
      jest
        .spyOn(DD, "generateMDTR")
        .and.returnValue('<td class="test">TEST</td>');
      DD.modifyMDs("add", {});
      expect(DD.displayList.find(".test").length).toBe(1);
      expect(DD.displayList.find(".test").text()).toBe("TEST");
    });

    it("should remove given exam from list", function () {
      var MD = { id: "test-1234" };
      jest
        .spyOn(DD, "generateMDTR")
        .and.returnValue(
          '<tr data-id="' + MD.id + '"><td class="test">TEST</td></tr>'
        );
      DD.modifyMDs("add", MD);
      expect(DD.displayList.find(".test").length).toBe(1);
      expect(DD.displayList.find(".test").text()).toBe("TEST");
      DD.modifyMDs("delete", MD);
      expect(DD.displayList.find(".test").length).toBe(0);
    });

    it('should add a "no exams" empty cell when removing all exams', function () {
      var MD = { id: "test-5678" };
      jest
        .spyOn(DD, "generateMDTR")
        .and.returnValue(
          '<tr data-id="' + MD.id + '"><td class="test">TEST</td></tr>'
        );
      DD.modifyMDs("add", MD);
      expect(DD.displayList.find(".empty").length).toBe(0);
      DD.modifyMDs("delete", MD);
      expect(DD.displayList.find(".empty").length).toBe(1);
    });
  });

  describe(".generateMDRT()", function () {
    var DD, MD;
    beforeEach(function () {
      DD = new CertStat.DeliveryDetails(
        $('<div><input type="button" name="country"></div>'),
        $("<div>")
      );
      MD = {
        id: "test-1234",
        rawData: {
          qualification: "test-qualification",
          month: "January",
          year: "1900",
          candidateNumber: "1234",
          centreName: "TestCentre"
        }
      };
    });
    afterEach(function () {
      DD = undefined;
      MD = undefined;
    });

    it("should return a jQuery object", function () {
      var markup = DD.generateMDTR(MD);
      expect(markup instanceof jQuery).toBe(true);
    });

    it("should generate acceptable markup", function () {
      var markup = DD.generateMDTR(MD);
      expect(markup.html()).not.toBe("");
      expect($('[data-key="series"]', markup).text()).toBe(
        MD.rawData.qualification +
          " in " +
          MD.rawData.month +
          " " +
          MD.rawData.year
      );
      expect($('[data-key="candidate"]', markup).text()).toBe(
        MD.rawData.candidateNumber
      );
      expect($('[data-key="centre"]', markup).text()).toBe(
        MD.rawData.centreName
      );
      expect(
        $('[data-key="statements"] [data-trigger="minus"]', markup).html()
      ).toBe($("<div>&minus;</div>").html());
      expect(
        $('[data-key="statements"] [data-trigger="plus"]', markup).html()
      ).toBe($("<div>&plus;</div>").html());
      expect(
        $('[data-key="authenticated"] [data-trigger="minus"]', markup).html()
      ).toBe($("<div>&minus;</div>").html());
      expect(
        $('[data-key="authenticated"] [data-trigger="plus"]', markup).html()
      ).toBe($("<div>&plus;</div>").html());
      expect($('[data-key="statementCount"]', markup).text()).toBe("0");
      expect($('[data-key="authenticatedCount"]', markup).text()).toBe("0");
    });

    it("should add click handlers to the plus / minus buttons", function () {
      var markup = DD.generateMDTR(MD);
      expect($('[data-key="statementCount"]', markup).text()).toBe("0");
      $('[data-key="statements"] [data-trigger="plus"]', markup).trigger(
        "click"
      );
      expect($('[data-key="statementCount"]', markup).text()).toBe("1");
      $('[data-key="statements"] [data-trigger="plus"]', markup).trigger(
        "click"
      );
      expect($('[data-key="statementCount"]', markup).text()).toBe("2");
      $('[data-key="statements"] [data-trigger="plus"]', markup).trigger(
        "click"
      );
      expect($('[data-key="statementCount"]', markup).text()).toBe("3");
      $('[data-key="statements"] [data-trigger="minus"]', markup).trigger(
        "click"
      );
      expect($('[data-key="statementCount"]', markup).text()).toBe("2");
      $('[data-key="statements"] [data-trigger="minus"]', markup).trigger(
        "click"
      );
      expect($('[data-key="statementCount"]', markup).text()).toBe("1");
      $('[data-key="statements"] [data-trigger="minus"]', markup).trigger(
        "click"
      );
      expect($('[data-key="statementCount"]', markup).text()).toBe("0");

      expect($('[data-key="authenticatedCount"]', markup).text()).toBe("0");
      $('[data-key="authenticated"] [data-trigger="plus"]', markup).trigger(
        "click"
      );
      expect($('[data-key="authenticatedCount"]', markup).text()).toBe("1");
      $('[data-key="authenticated"] [data-trigger="plus"]', markup).trigger(
        "click"
      );
      expect($('[data-key="authenticatedCount"]', markup).text()).toBe("2");
      $('[data-key="authenticated"] [data-trigger="plus"]', markup).trigger(
        "click"
      );
      expect($('[data-key="authenticatedCount"]', markup).text()).toBe("3");
      $('[data-key="authenticated"] [data-trigger="minus"]', markup).trigger(
        "click"
      );
      expect($('[data-key="authenticatedCount"]', markup).text()).toBe("2");
      $('[data-key="authenticated"] [data-trigger="minus"]', markup).trigger(
        "click"
      );
      expect($('[data-key="authenticatedCount"]', markup).text()).toBe("1");
      $('[data-key="authenticated"] [data-trigger="minus"]', markup).trigger(
        "click"
      );
      expect($('[data-key="authenticatedCount"]', markup).text()).toBe("0");
    });

    it("should not allow you to select less than 0 of an item,", function () {
      var markup = DD.generateMDTR(MD);
      expect($('[data-key="statementCount"]', markup).text()).toBe("0");
      $('[data-key="statements"] [data-trigger="minus"]', markup).trigger(
        "click"
      );
      expect($('[data-key="statementCount"]', markup).text()).toBe("0");
      $('[data-key="statements"] [data-trigger="minus"]', markup).trigger(
        "click"
      );
      expect($('[data-key="statementCount"]', markup).text()).toBe("0");
    });
  });

  describe(".parseCountry()", function () {
    var DD, option;
    beforeEach(function () {
      option = $(
        '<select><option data-code="44"></option><option data-code="1"></option></select>'
      );
      DD = new CertStat.DeliveryDetails(
        $(
          '<div><div class="delivery_options"><div class="british_option hidden"></div><div class="non_british_option hidden"></div></div></div>'
        ),
        $("<div>")
      );
    });
    afterEach(function () {
      DD = undefined;
      option = undefined;
    });

    it("should show British options if a British country code is selected", function () {
      option.find('[data-code="44"]').prop("selected", true);
      expect(
        DD.inputForm
          .find(".delivery_options .british_option")
          .hasClass("hidden")
      ).toBe(true);
      DD.parseCountry(option);
      expect(
        DD.inputForm
          .find(".delivery_options .british_option")
          .hasClass("hidden")
      ).toBe(false);
      expect(
        DD.inputForm
          .find(".delivery_options .non_british_option")
          .hasClass("hidden")
      ).toBe(true);
    });

    it("should show non-British options if a non-British country code is selected", function () {
      option.find('[data-code="1"]').prop("selected", true);
      expect(
        DD.inputForm
          .find(".delivery_options .non_british_option")
          .hasClass("hidden")
      ).toBe(true);
      DD.parseCountry(option);
      expect(
        DD.inputForm
          .find(".delivery_options .non_british_option")
          .hasClass("hidden")
      ).toBe(false);
      expect(
        DD.inputForm
          .find(".delivery_options .british_option")
          .hasClass("hidden")
      ).toBe(true);
    });
  });

  describe(".addDetail()", function () {
    var DD;
    beforeEach(function () {
      DD = new CertStat.DeliveryDetails($("<div>"), $("<div>"));
    });
    afterEach(function () {
      DD = undefined;
    });
    it("`beforeEach` and `afterEach` must have a test within a describe block", function () {
      // Do a test
    });
  });
});
