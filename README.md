# adapt-contrib-objectMatching

Object Matching Component/Plug-in developed by Exult Corporation for Adapt Framework.

A basic Object Matching Component/Plug-in that try to match most close items.

[Visit the **ObjectMatching** wiki](https://github.com/ExultCorp/adapt-contrib-objectMatching/wiki) for more information about its functionality and for explanations of key properties.

## Installation

* If **ObjectMatching** has been uninstalled from the Adapt framework, it may be reinstalled.
With the [Adapt CLI](https://github.com/adaptlearning/adapt-cli) installed, run the following from the command line:
`adapt install adapt-contrib-objectMatching`

    Alternatively, this component can also be installed by adding the following line of code to the *adapt.json* file:  
    `"adapt-contrib-objectMatching": "*"`  
    Then running the command:  
    `adapt install`  
    (This second method will reinstall all plug-ins listed in *adapt.json*.)  

* If **ObjectMatching** has been uninstalled from the Adapt authoring tool, it may be reinstalled using the [Plug-in Manager](https://github.com/adaptlearning/adapt_authoring/wiki/Plugin-Manager).  
<div float align=right><a href="#top">Back to Top</a></div>

## Usage

Once installed, the component can be used to create a question with one or more clickable tab based answers. Once the reader selects all their answers, the question may be submitted.

Upon submission, feedback will be provided. Feedback can be provided for correct, incorrect and partially correct answers.

If all answers are correct, no further learner interaction is available.

If one or more answers are incorrect, the user may reset their submission, and try again. The amount of times they can do this is determined by the ``_attempts`` setting. Subsequent submissions are treated as before, until the maximum number of attempts is reached. At this point, the user is presented with the opportunity to view the model answer, and compare this with their own submission.

Further submission is not available.

## Settings overview

A complete example of this components settings can be found in the [example.json](https://github.com/ExultCorp/adapt-contrib-objectMatching/blob/master/example.json) file. A description of the core settings can be found at: [Core model attributes](https://github.com/adaptlearning/adapt_framework/wiki/Core-model-attributes)

### Attributes

Further settings for this component are:

**_component** (string): This value must be: `objectMatching`

**_classes** (string): CSS class name to be applied to **ObjectMatching**’s containing `div`. The class must be predefined in one of the Less files. Separate multiple classes with a space.

**_layout** (string): This defines the horizontal position of the component in the block. Acceptable values are `full`, `left` or `right`.

**_defaultAnswerBGColor** (string): This define default background color for all option items.

**_items** (array): Multiple items may be created. Each *item* represents one element of the objectMatching. Text values can be entered for **question**, **answer** and **backgroundColor** for each element.

>**question** (string): Text that functions as the question.  

>**answer** (string): The answer contains option text.  

>**questionBGColor** (string): This will contain the color which user want as background for this question tab. this will also get applied to the answer tab if learner select it.

### Accessibility
**ObjectMatching** has been assigned a label using the [aria-label](https://github.com/adaptlearning/adapt_framework/wiki/Aria-Labels) attribute: **ariaRegion**. This label is not a visible element. It is utilized by assistive technology such as screen readers. Should the region's text need to be customised, it can be found within the **globals** object in [*properties.schema*](https://github.com/adaptlearning/adapt-contrib-matching/blob/master/properties.schema).   
<div float align=right><a href="#top">Back to Top</a></div>

## Limitations  
 
No known limitations.

## Browser spec

This component has been tested to the standard Adapt browser specification.
