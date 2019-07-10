/*
* adapt-contrib-objectMatching
* License - https://github.com/ExultCorp/adapt-contrib-objectMatching/blob/master/LICENSE
* Maintainers - Himanshu Rajotia <himanshu.rajotia@exultcorp.com>
*/
define([
    'core/js/adapt',
    'core/js/views/questionView'
], function (Adapt, QuestionView) {

    var ObjectMatching = QuestionView.extend({

        events: {
            "click .objectMatching-category-item": "onCategorySelected",
            "click .objectMatching-option-item": "onOptionSelected"
        },

        // Used by the question to reset the question when revisiting the component
        resetQuestionOnRevisit: function () {
            this.setAllItemsEnabled(true);
            this.resetQuestion();
        },

        // Used by question to setup itself just before rendering
        setupQuestion: function () {
            this.setupModel();
        },

        setupModel: function () {
            if (!this.model.get('_defaultAnswerBGColor')) {
                this.model.set('_defaultAnswerBGColor', '#C1D4EC');
            }
            this.model.set("_selectedCategoryId", "");

            if (!this.model.get("_isSubmitted")) {
                var categories = [],
                    options = [];
                _.each(this.model.get("_items"), function (item, index) {
                    index = index.toString();
                    item['id'] = index;
                    categories.push({ id: index, category: item["question"], categoryColor: item["questionBGColor"] });
                    options.push({ id: index, option: item["answer"] });
                }, this);

                if (this.model.get("_isRandom") && this.model.get("_isEnabled")) {
                    categories = _.shuffle(categories);
                    options = _.shuffle(options);
                }

                this.model.set("categoryItems", categories);
                this.model.set("optionItems", options);
                return;
            }
            this.updateItems();
        },

        // Used by question to disable the question during submit and complete stages
        disableQuestion: function () {
            this.setAllItemsEnabled(false);
        },

        // Used by question to enable the question during interactions
        enableQuestion: function () {
            this.setAllItemsEnabled(true);
        },

        setAllItemsEnabled: function (isEnabled) {
            if (isEnabled) {
                this.$('.objectMatching-widget').removeClass('disabled');
            } else {
                this.$('.objectMatching-widget').addClass('disabled');
            }
        },

        // Used by question to setup itself just after rendering
        onQuestionRendered: function () {
            this.setReadyStatus();
            if (this.model.get("_isSubmitted")) {
                this.showMarking();
                this.setAllItemsEnabled(false);
            }
        },

        onCategorySelected: function (event) {
            event.preventDefault();
            if (!this.model.get("_isEnabled") || this.model.get("_isSubmitted")) return;

            this.$(".objectMatching-category-item-cotainer").removeClass("objectMatching-category-item-border");

            var $selectedCategoryElement = $(event.currentTarget);
            var categoryItemId = $selectedCategoryElement.attr('data-id');
            if (this.model.get("_selectedCategoryId") === categoryItemId) {
                this.model.set("_selectedCategoryId", "");
                return;
            }
            $selectedCategoryElement.closest(".objectMatching-category-item-cotainer").addClass("objectMatching-category-item-border");
            this.model.set("_selectedCategoryId", categoryItemId);
        },

        onOptionSelected: function (event) {
            event.preventDefault();
            if (!this.model.get("_isEnabled") || this.model.get("_isSubmitted") || !this.model.get("_selectedCategoryId")) return;

            var $selectedOptionElement = $(event.currentTarget);
            var selectedOptionId = $selectedOptionElement.attr('data-id');
            var selectedItem = this.getItemById(selectedOptionId);
            var categoryItem = this.getItemById(this.model.get("_selectedCategoryId"));
            if (selectedItem.selectedOptionId && selectedItem.selectedOptionId === categoryItem['id']) {
                selectedItem.selectedOptionId = '';
                selectedItem._isSelected = false;
                $selectedOptionElement.css("backgroundColor", this.model.get("_defaultAnswerBGColor"));
                return;
            }
            this.removePeviouslySelectedOption(categoryItem['id']);
            selectedItem.selectedOptionId = categoryItem['id'];
            selectedItem._isSelected = true;
            $selectedOptionElement.css("backgroundColor", categoryItem['questionBGColor']);

        },

        removePeviouslySelectedOption: function (selectedOptionId) {
            var defaultColor = this.model.get("_defaultAnswerBGColor");
            _.each(this.model.get("_items"), function (item) {
                if (item.selectedOptionId == selectedOptionId) {
                    item.selectedOptionId = '';
                    item._isSelected = false;
                    this.$(".objectMatching-option-item[data-id='" + item['id'] + "']")
                        .css("backgroundColor", defaultColor);
                }
            }, this);
        },

        getItemById: function (id) {
            return _.filter(this.model.get("_items"), function (item) {
                return id == item['id'];
            }, this)[0];
        },

        getOptionItemById: function (id) {
            return _.filter(this.model.get("optionItems"), function (optionItems) {
                return id == optionItems['id'];
            }, this)[0];
        },

        //Use to check if the user is allowed to submit the question
        canSubmit: function () {
            return this.getNumberOfOptionsSelected() === this.model.get("_items").length;
        },

        getNumberOfOptionsSelected: function () {
            return _.filter(this.model.get("_items"), function (item) {
                return item._isSelected;
            }, this).length;
        },

        // Blank method for question to fill out when the question cannot be submitted
        onCannotSubmit: function () {
        },

        //This preserve the state of the users answers for returning or showing the users answer
        storeUserAnswer: function () {
            var userAnswer = [];
            _.each(this.model.get('_items'), function (item, index) {
                userAnswer.push([
                    +this.model.get('categoryItems')[index].id,
                    +this.model.get("optionItems")[index].id,
                    +item.selectedOptionId
                ]);
            }, this);
            this.model.set('_userAnswer', userAnswer);
        },

        // this return a boolean based upon whether to question is correct or not
        isCorrect: function () {
            var numberOfCorrectAnswers = 0;

            _.each(this.model.get('_items'), function (item, index) {
                var correctSelected = item.id == item.selectedOptionId;
                if (item._isSelected && correctSelected) {
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
        setScore: function () {
            var numberOfCorrectAnswers = this.model.get('_numberOfCorrectAnswers');
            var questionWeight = this.model.get("_questionWeight");
            var itemLength = this.model.get('_items').length;

            var score = questionWeight * numberOfCorrectAnswers / itemLength;

            this.model.set('_score', score);
        },

        // This is important and should give the user feedback on how they answered the question
        // Normally done through ticks and crosses by adding classes
        showMarking: function () {
            if (!this.model.get('_canShowMarking')) return;
            this.$(".objectMatching-category-item-cotainer").removeClass("objectMatching-category-item-border");

            _.each(this.model.get('optionItems'), function (item, index) {
                var $item = this.$('.objectMatching-option-item-cotainer').eq(index);
                $item.addClass(item._isCorrect ? 'correct' : 'incorrect');
            }, this);
        },

        // Used by the question to determine if the question is incorrect or partly correct
        isPartlyCorrect: function () {
            return this.model.get('_isAtLeastOneCorrectSelection');
        },

        // Used by the question view to reset the stored user answer
        resetUserAnswer: function () {
            this.model.set({
                _selectedCategoryId: '',
                _userAnswer: []
            });
        },

        // Used by the question view to reset the look and feel of the component.
        // This could also include resetting item data
        resetQuestion: function () {
            this.$(".objectMatching-category-item-cotainer").removeClass("objectMatching-category-item-border");

            _.each(this.model.get("_items"), function (item) {
                item.selectedOptionId = "";
                item._isSelected = false;
                item._isCorrect = false;
            }, this);

            this.resetItems();
        },

        resetItems: function () {
            this.$(".objectMatching-category-item-cotainer").removeClass("objectMatching-category-item-border");
            this.$(".objectMatching-category-item").addClass("objectMatching-cursor-pointer");
            this.$(".objectMatching-option-item")
                .addClass("objectMatching-cursor-pointer")
                .css("backgroundColor", this.model.get("_defaultAnswerBGColor"));
        },

        // Used by the question to display the correct answer to the user
        showCorrectAnswer: function () {
            _.each(this.model.get('_items'), function (item) {
                var $element = this.$('.objectMatching-option-item[data-id=' + item['id'] + ']');
                $element.css('backgroundColor', item['questionBGColor']);
            }, this);
        },

        // Used by the question to display the users answer and
        // hide the correct answer
        // Should use the values stored in storeUserAnswer
        hideCorrectAnswer: function () {
            _.each(this.model.get('_items'), function (item, index, list) {
                var selected_opt = item['selectedOptionId'];
                var $element = this.$('.objectMatching-option-item[data-id=' + item['id'] + ']');
                $element.css('backgroundColor', list[+selected_opt]['questionBGColor']);
            }, this);
        },

        updateItems: function () {
            var userAnswer = this.model.get('_userAnswer');
            var categories = [];
            var options = [];
            var items = this.model.get('_items');
            userAnswer.forEach(function (item, index) {
                var catId = item[0];
                var optId = item[1];
                items[index]['id'] = index.toString();
                items[index].selectedOptionId = item[2].toString();
                items[index]._isSelected = true;
                categories.push({ id: catId.toString(), category: items[catId]["question"], categoryColor: items[catId]["questionBGColor"] });
                options.push({ id: optId.toString(), option: items[optId]["answer"] });
            }.bind(this));

            this.model.set("categoryItems", categories);
            this.model.set("optionItems", options);
            //setup the options are correct or not.
            this.isCorrect();
        },

        /**
       * Used by adapt-contrib-spoor to get the user's answers in the format required by the cmi.interactions.n.student_response data field
       * @return {string} the user's answers as a string in the format "1.1#2.3#3.2" assuming user selected option 1 in drop-down 1,
       * option 3 in drop-down 2 and option 2 in drop-down 3. The '#' character will be changed to either ',' or '[,]' by adapt-contrib-spoor,
       * depending on which SCORM version is being used.
       */
        getResponse: function () {
            var responses = [];

            this.model.get('_items').forEach(function (item, index) {
                responses.push((index + 1) + "." + ((+item.selectedOptionId) + 1));// convert from 0-based to 1-based counting
            }.bind(this));

            return responses.join(',');
        },

        /**
        * Used by adapt-contrib-spoor to get the type of this question in the format required by the cmi.interactions.n.type data field
        * @return {string}
        */
        getResponseType: function () {
            return "matching";
        }

    });

    Adapt.register("objectMatching", ObjectMatching);

    return ObjectMatching;

});
