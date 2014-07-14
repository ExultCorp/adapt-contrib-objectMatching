#adapt-contrib-objectMatching

Object Matching Component/Plug-in developed by CrediPoint Solutions for Adapt Framework v1.1.0.

A basic Object Matching Component/Plug-in that try to match most close items.

##Installation

First, be sure to install the [Adapt Command Line Interface](https://github.com/cajones/adapt-cli), then from the command line run:

		adapt install adapt-contrib-objectMatching

##Usage

Once installed, the component can be used to create a question with one or more clickable tab based answers. Once the reader selects all their answers, the question may be submitted.

Upon submission, feedback will be provided. Feedback can be provided for correct, incorrect and partially correct answers.

If all answers are correct, no further learner interaction is available.

If one or more answers are incorrect, the user may reset their submission, and try again. The amount of times they can do this is determined by the ``_attempts`` setting. Subsequent submissions are treated as before, until the maximum number of attempts is reached. At this point, the user is presented with the opportunity to view the model answer, and compare this with their own submission.

Further submission is not available.

##Settings overview

For example JSON format, see [example.json](https://github.com/CrediPointSolutions/adapt-contrib-objectMatching/blob/master/example.json).

Further settings for this component are:

####_component

This value must be: `objectMatching`

####_classes

You can use this setting to add custom classes to your template and LESS file.

####_layout

This defines the position of the component in the block. Values can be `full`, `left` or `right`.

####_defaultAnswerBGColor

This define default background color for all answer items.

####_item

Each item represents one element of the objectMatching. Text values can be entered for `question`,`answer` and `backgroundColor` for each element.

####question

The question contain question text.

####answer

The answer contains answer text.

###questionBGColor

This will contain the color which user want as background for this question tab. this will also get applied to the answer tab if learner select it.

##Limitations

To be completed.

##Browser spec

This component has been tested to the standard Adapt browser specification.
