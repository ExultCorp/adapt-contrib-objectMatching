/*
 * adapt-contrib-objectMatching
 * License - https://github.com/ExultCorp/adapt-contrib-objectMatching/blob/master/LICENSE
 * Maintainers - Himanshu Rajotia <himanshu.rajotia@exultcorp.com>
 */
define([
    'coreJS/adapt',
    'coreViews/questionView'
], function(Adapt, QuestionView) {

    var ObjectMatching = QuestionView.extend({

        events: {
            "click .objectMatching-category-item": "onCategorySelected",
            "click .objectMatching-option-item": "onOptionSelected"
        },

        // Used by the question to reset the question when revisiting the component
        resetQuestionOnRevisit: function() {
            this.setAllItemsEnabled(true);
            this.resetQuestion();
        },

        // Used by question to setup itself just before rendering
        setupQuestion: function() {
            this.setupModel();
        },

        setupModel: function() {
            if(!this.model.get('_defaultAnswerBGColor')) {
                this.model.set('_defaultAnswerBGColor', '#C1D4EC');
            }
            this.model.set("_selectedCategoryId", "");

            if(!this.model.get("_isSubmitted")) {
                var categories = [],
                    options = [];

                _.each(this.model.get("_items"), function(item, index) {
                    item['id'] = index;
                    categories.push({id: index, category: item["question"], categoryColor: item["questionBGColor"]});
                    options.push({id: index, option: item["answer"]});
                }, this);

                if(this.model.get("_isRandom") && this.model.get("_isEnabled")) {
                    categories = _.shuffle(categories);
                    options = _.shuffle(options);
                }

                this.model.set("categoryItems", categories);
                this.model.set("optionItems", options);
            }
        },

        // Used by question to disable the question during submit and complete stages
        disableQuestion: function() {
            this.setAllItemsEnabled(false);
        },

        // Used by question to enable the question during interactions
        enableQuestion: function() {
            this.setAllItemsEnabled(true);
        },

        setAllItemsEnabled: function(isEnabled) {
            if(isEnabled) {
                this.$('.objectMatching-widget').removeClass('disabled');
            } else {
                this.$('.objectMatching-widget').addClass('disabled');
            }
        },

        // Used by question to setup itself just after rendering
        onQuestionRendered: function() {
            this.setReadyStatus();
        },

        onCategorySelected: function(event) {
            event.preventDefault();
            if(!this.model.get("_isEnabled") || this.model.get("_isSubmitted")) return;

            this.$(".objectMatching-category-item-cotainer").removeClass("objectMatching-category-item-border");

            var $selectedElement = $(event.currentTarget);
            if(this.model.get("_selectedCategoryId") === $selectedElement.attr('data-id')) {
                this.model.set("_selectedCategoryId", "");
            } else {
                $selectedElement.closest(".objectMatching-category-item-cotainer").addClass("objectMatching-category-item-border");
                this.model.set("_selectedCategoryId", $selectedElement.attr('data-id'));
            }
        },

        onOptionSelected: function(event) {
            event.preventDefault();
            if(!this.model.get("_isEnabled") || this.model.get("_isSubmitted") || !this.model.get("_selectedCategoryId")) return;

            var $selectedElement = $(event.currentTarget);
            var selectedOptionId = parseInt($selectedElement.attr('data-id'));
            var selectedItem = this.getItemById(this.model.get("_selectedCategoryId"));
            if(selectedItem.selectedOptionId && selectedItem.selectedOptionId === selectedOptionId) {
                selectedItem.selectedOptionId = '';
                selectedItem._isSelected = false;
                $selectedElement.css("backgroundColor", this.model.get("_defaultAnswerBGColor"));
            } else {
                if(selectedItem.selectedOptionId) {
                    var previousSelectedItem = this.getItemById(selectedItem.selectedOptionId);

                    this.$(".objectMatching-option-item[data-id='" + previousSelectedItem['id'] + "']")
                        .css("backgroundColor", this.model.get("_defaultAnswerBGColor"));

                    previousSelectedItem.selectedOptionId = '';
                    previousSelectedItem._isSelected = false;
                }

                selectedItem.selectedOptionId = selectedOptionId;
                selectedItem._isSelected = true;
                $selectedElement.css("backgroundColor", selectedItem['questionBGColor']);
            }
        },

        getItemById: function(id) {
            return _.filter(this.model.get("_items"), function(item) {
                return id == item['id'];
            }, this)[0];
        },

        getOptionItemById: function(id) {
            return _.filter(this.model.get("optionItems"), function(optionItems) {
                return id == optionItems['id'];
            }, this)[0];
        },

        //Use to check if the user is allowed to submit the question
        canSubmit: function() {
            return this.getNumberOfOptionsSelected() === this.model.get("_items").length;
        },

        getNumberOfOptionsSelected: function() {
            return _.filter(this.model.get("_items"),function(item) {
                return item._isSelected;
            }, this).length;
        },

        // Blank method for question to fill out when the question cannot be submitted
        onCannotSubmit: function() {
        },

        //This preserve the state of the users answers for returning or showing the users answer
        storeUserAnswer: function() {
            var userAnswer = [];
            _.each(this.model.get('_items'), function(item, index) {
                userAnswer.push(_.extend({}, item));
            }, this);
            this.model.set('_userAnswer', userAnswer);
        },

        // this return a boolean based upon whether to question is correct or not
        isCorrect: function() {
            var numberOfCorrectAnswers = 0;

            _.each(this.model.get('_userAnswer'), function(item, index) {
                var correctSelected = item.id == item.selectedOptionId;
                if(item._isSelected && correctSelected) {
                    numberOfCorrectAnswers++;
                    item._isCorrect = true;
                    var optionItem = this.getOptionItemById(item['id']);
                    optionItem['_isCorrect'] = true;
                    this.model.set('_numberOfCorrectAnswers', numberOfCorrectAnswers);
                    this.model.set('_isAtLeastOneCorrectSelection', true);
                } else {
                    item._isCorrect = false;
                    this.getOptionItemById(item['id'])['_isCorrect'] = false;
                }

            }, this);

            return numberOfCorrectAnswers === this.model.get('_items').length;
        },

        // Used to set the score based upon the _questionWeight
        setScore: function() {
            var numberOfCorrectAnswers = this.model.get('_numberOfCorrectAnswers');
            var questionWeight = this.model.get("_questionWeight");
            var itemLength = this.model.get('_items').length;

            var score = questionWeight * numberOfCorrectAnswers / itemLength;

            this.model.set('_score', score);
        },

        // This is important and should give the user feedback on how they answered the question
        // Normally done through ticks and crosses by adding classes
        showMarking: function() {
            this.$(".objectMatching-category-item-cotainer").removeClass("objectMatching-category-item-border");

            _.each(this.model.get('optionItems'), function(item, index) {
                var $item = this.$('.objectMatching-option-item-cotainer').eq(index);
                $item.addClass(item._isCorrect ? 'correct' : 'incorrect');
            }, this);
        },

        // Used by the question to determine if the question is incorrect or partly correct
        isPartlyCorrect: function() {
            return this.model.get('_isAtLeastOneCorrectSelection');
        },

        // Used by the question view to reset the stored user answer
        resetUserAnswer: function() {
            this.model.set({
                _selectedCategoryId: '',
                _userAnswer: []
            });
        },

        // Used by the question view to reset the look and feel of the component.
        // This could also include resetting item data
        resetQuestion: function() {
            this.$(".objectMatching-category-item-cotainer").removeClass("objectMatching-category-item-border");

            _.each(this.model.get("_items"), function(item) {
                item.selectedOptionId = "";
                item._isSelected = false;
                item._isCorrect = false;
            }, this);

            this.resetItems();
        },

        resetItems: function() {
            this.$(".objectMatching-category-item-cotainer").removeClass("objectMatching-category-item-border");
            this.$(".objectMatching-category-item").addClass("objectMatching-cursor-pointer");
            this.$(".objectMatching-option-item")
                .addClass("objectMatching-cursor-pointer")
                .css("backgroundColor", this.model.get("_defaultAnswerBGColor"));
        },

        // Used by the question to display the correct answer to the user
        showCorrectAnswer: function() {
            _.each(this.model.get('_items'), function(item) {
                var $element = this.$('.objectMatching-option-item[data-id=' + item['id'] + ']');
                $element.css('backgroundColor', item['questionBGColor']);
            }, this);
        },

        // Used by the question to display the users answer and
        // hide the correct answer
        // Should use the values stored in storeUserAnswer
        hideCorrectAnswer: function() {
            _.each(this.model.get('_userAnswer'), function(item) {
                var $element = this.$('.objectMatching-option-item[data-id=' + item['selectedOptionId'] + ']');
                $element.css('backgroundColor', item['questionBGColor']);
            }, this);
        }

    });

    Adapt.register("objectMatching", ObjectMatching);

    return ObjectMatching;

});
