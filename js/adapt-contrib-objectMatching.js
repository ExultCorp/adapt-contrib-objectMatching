/*
 * adapt-contrib-objectMatching
 * License - https://github.com/CrediPointSolutions/adapt-contrib-objectMatching/blob/master/LICENSE
 * Maintainers - Himanshu Rajotia <himanshu.rajotia@credipoint.com>, CrediPoint Solutions <git@credipoint.com>
 */
define(function(require) {
  var QuestionView = require("coreViews/questionView");
  var Adapt = require("coreJS/adapt");

  var ObjectMatching = QuestionView.extend({

    events: {
      "click .objectMatching-widget .button.submit": "onSubmitClicked",
      "click .objectMatching-widget .button.reset": "onResetClicked",
      "click .objectMatching-widget .button.model": "onModelAnswerClicked",
      "click .objectMatching-widget .button.user": "onUserAnswerClicked",
      "click .objectMatching-category-item": "onCategoryClicked",
      "click .objectMatching-option-item": "onOptionClicked"
    },

    initialize: function() {
      QuestionView.prototype.initialize.apply(this, arguments);

      this.model.set("_currentSelectedCategory", "");
      _.each(this.model.get("items"), function(item) {
        item.selectedOption = "";
        item.selectedOptionColor = "";
        item.selected = false;
      }, this);
    },

    preRender: function() {
      QuestionView.prototype.preRender.apply(this);

      var categories = [];
      var options = [];
      _.each(this.model.get("items"), function(item) {
        categories.push({category: item["question"], categoryColor: item["backgroundColor"]});
        options.push({option: item["answer"]});
      }, this);

      if (this.model.get("_isRandom") && this.model.get("_isEnabled")) {
        categories = _.shuffle(categories);
        options = _.shuffle(options);
      }
      this.model.set("categories", categories);
      this.model.set("options", options);

      this.setDeviceSize();
    },

    setDeviceSize: function() {
      if (Adapt.device.screenSize === "large") {
        this.$el.addClass("desktop").removeClass("mobile");
        this.model.set("_isDesktop", true);
      } else {
        this.$el.addClass("mobile").removeClass("desktop");
        this.model.set("_isDesktop", false)
      }
    },

    postRender: function() {
      QuestionView.prototype.postRender.apply(this);

      this.setResetButtonEnabled(false);
      this.setReadyStatus();
    },

    resetQuestion: function(properties) {
      QuestionView.prototype.resetQuestion.apply(this, arguments);

      this.model.set("_currentSelectedCategory", "");
      _.each(this.model.get("items"), function(item) {
        item.selectedOption = "";
        item.selectedOptionColor = "";
        item.selected = false;
      }, this);
    },

    getItemUsingCategory: function(category) {
      var item;
      if (category) {
        item = _.filter(this.model.get("items"), function(item) {
          return category === item["question"];
        }, this)[0];
      }
      return item;
    },

    getItemUsingOption: function(option) {
      var item;
      if (option) {
        item = _.filter(this.model.get("items"), function(item) {
          return option === item["answer"];
        }, this)[0];
      }
      return item;
    },

    getItemUsingSelectedOption: function(option) {
      var item;
      if (option) {
        item = _.filter(this.model.get("items"), function(item) {
          return option === item.selectedOption;
        }, this)[0];
      }
      return item;
    },

    canSubmit: function() {
      return this.getNumberOfOptionsSelected() === this.model.get("_selectable");
    },

    canReset: function() {
      return !this.$(".objectMatching-widget, .button.reset").hasClass("disabled");
    },

    forEachAnswer: function(callback) {
      _.each(this.model.get("items"), function(item) {
        var correctSelection = item["answer"] === item.selectedOption;
        if (item.selected && correctSelection) {
          this.model.set("_isAtLeastOneCorrectSelection", true);
        }
        callback(correctSelection, item);
      }, this);
    },

    markQuestion: function() {
      this.forEachAnswer(function(correct, item) {
        item.correct = correct;
      });
      QuestionView.prototype.markQuestion.apply(this);
    },

    resetItems: function() {
      this.$(".objectMatching-category-item-container").removeClass("objectMatching-category-item-container-border");
      this.$(".objectMatching-category-item").addClass("objectMatching-cursor-pointer");
      this.$(".objectMatching-option-item")
        .addClass("objectMatching-cursor-pointer")
        .attr("category", "")
        .css("backgroundColor", "#C1D4EC");
    },

    getNumberOfOptionsSelected: function() {
      var count = 0;

      _.each(this.model.get("items"), function(item) {
        if (item.selected) count++;
      }, this);

      return count;
    },

    setResetButtonEnabled: function(enabled) {
      this.$(".button.reset").toggleClass("disabled", !enabled);
    },

    storeUserAnswer: function() {
      var userAnswer = [];
      _.each(this.model.get("items"), function(item) {
        userAnswer.push(item.selected);
      }, this);
      this.model.set("_userAnswer", userAnswer);
    },

    onCategoryClicked: function(event) {
      event.preventDefault();
      var $selectedElement = $(event.target);
      if (this.model.get("_currentSelectedCategory") === $selectedElement.text().trim()) {
        this.$(".objectMatching-category-item-container").removeClass("objectMatching-category-item-container-border");
        this.model.set("_currentSelectedCategory", "");
      } else if (this.model.get("_isEnabled") && !this.model.get("_isSubmitted")) {
        this.$(".objectMatching-category-item-container").removeClass("objectMatching-category-item-container-border");
        $selectedElement.closest(".objectMatching-category-item-container").addClass("objectMatching-category-item-container-border");
        this.model.set("_currentSelectedCategory", $selectedElement.text().trim());
      }
    },

    onOptionClicked: function(event) {
      event.preventDefault();
      var $selectedElement = $(event.target);
      var selectedOption = $selectedElement.text().trim();
      if (this.model.get("_isEnabled") && !this.model.get("_isSubmitted") && this.model.get("_currentSelectedCategory")) {
        var currentItem = this.getItemUsingCategory(this.model.get("_currentSelectedCategory"));
        if (currentItem) {
          if (currentItem["question"] === $selectedElement.attr("category") && currentItem.selectedOption === selectedOption) {
            currentItem.selectedOption = "";
            currentItem.selectedOptionColor = "";
            currentItem.selected = false;
            $selectedElement.css("backgroundColor", "#C1D4EC");
            this.$(".objectMatching-option-item[category=" + currentItem["question"] + "]").attr("category", "");
          } else {
            if (currentItem.selectedOption) {
              this.$(".objectMatching-option-item[category=" + currentItem["question"] + "]")
                .css("backgroundColor", "#C1D4EC")
                .attr("category", "");
            }

            var item = _.filter(this.model.get("items"), function(item) {
              return item.selectedOption === selectedOption;
            }, this)[0];

            if (item) {
              item.selectedOption = "";
              item.selectedOptionColor = "";
              item.selected = false;
            }

            currentItem.selectedOption = selectedOption;
            currentItem.selectedOptionColor = currentItem["backgroundColor"];
            currentItem.selected = true;
            $selectedElement.css("backgroundColor", currentItem.selectedOptionColor);
            $selectedElement.attr("category", currentItem["question"]);
          }
        }
      }
    },

    onResetClicked: function(event) {
      if (this.canReset()) {
        QuestionView.prototype.onResetClicked.apply(this, arguments);
      } else {
        if (event) {
          event.preventDefault();
        }
      }
    },

    onSubmitClicked: function(event) {
      QuestionView.prototype.onSubmitClicked.apply(this, arguments);

      if (this.canSubmit()) {
        this.$(".objectMatching-category-item-container").removeClass("objectMatching-category-item-container-border");
        this.setResetButtonEnabled(!this.model.get("_isComplete"));
      }
    },

    onUserAnswerShown: function(event) {
      _.each(this.$(".objectMatching-option-item"), function(optionItem) {
        var $element = $(optionItem);
        var category = $element.attr("category");
        var item = this.getItemUsingSelectedOption($element.text().trim());
        if (item) {
          $element.css("backgroundColor", item["backgroundColor"]);
          if (item["answer"] === item.selectedOption) {
            $element.closest(".item").removeClass("correct incorrect").addClass("correct");
          } else {
            $element.closest(".item").removeClass("correct incorrect").addClass("incorrect");
          }
        }
      }, this);
    },

    onModelAnswerShown: function() {
      _.each(this.$(".objectMatching-option-item"), function(optionItem) {
        var $element = $(optionItem);
        var item = this.getItemUsingOption($element.text().trim());
        if (item) {
          $element.css("backgroundColor", item["backgroundColor"]);
        }
      }, this);
    }

  });

  Adapt.register("objectMatching", ObjectMatching);

  return ObjectMatching;

});