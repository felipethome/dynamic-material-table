Raccoon Interface Style Guide
=============================


Javascript Style Guide
----------------------

+ https://google.github.io/styleguide/javascriptguide.xml

+ Indentation must be 2 SPACES.

+ Curly braces example:
        
        var x = function () {
            
        }

+ If-Else example:

        if (x == 1) {
            
        }
        else if (x == 2) {
            
        }
        else {
            
        }

+ Always use === and !== for comparisons. The == and != do type coersion and therefore are unreliable.

+ Always use typeof to compare to "undefined". The "typeof" operator always return a string and therefore you will not have errors trying to access a variable that does not exist.

+ Prefer single quotes over double quotes.

+ Variables and functions must be lower camelCase.

+ Constants must be written with uppercase letters and underlines.

+ Binary operators must have one space on both sides. E.g.: Correct: 2 + 2. Wrong: 2+2.

+ Always declare variables using the "var" keyword.

+ Anonymous functions must have one space between the parenthesis and the keyword "function". E.g.:var x = function () {}.

+ Recommended: if (), for (), while (). Not recommended: if(), for(), while()

+ Define functions as var fn = function () {} instead of function fn() {}. The first one is known as function expression, and the second as function declaration. + Using a function expression help us to know the visibility of this function.

+ Just use "for..in" for objects.

+ Keep all the variable declarations (not initializations) at the top of your function/script. Scope in Javascript is per function or script. Keep the initializations there help you to remember that, besides they will be moved there anyway because of the hoisting process (and remember the hoisting process just move the declarations not the initializations to the top of your current scope).

+ When you need to write modules manually give preference primarily to the Revealing Module Pattern and secondly to the Locally scoped Object Literal.



HTML Style Guide
----------------

+ https://google.github.io/styleguide/htmlcssguide.xml

+ Indentation must be 2 SPACES.

+ Ids must be written in lower case and different words separated by dashes.

+ The head and body tags must be at the same indentation level of the html tag.



CSS Style Guide
---------------

+ https://google.github.io/styleguide/htmlcssguide.xml

+ Indentation must be 2 SPACES.

+ Curly braces example:
        
        .my-class {
            
        }

+ All css classes must be lower case and different words separated by dashes.

+ Use CSSComb to organize the CSS properties. Be aware that you will need to change the following settings of CSSComb:
        
        // Set space before `{`.
        "space-before-opening-brace": " ",

        // Set indent for code inside blocks, including media queries and nested rules.
        "block-indent": "  ",

+ Use always shorthand properties. Example:
       
        /* Recommended */
        .my-class {
            border: solid 1px black;
        }

        /* Not recommended */
        my-class {
            border-style: solid;
            border-size: 1px;
            border-color: black;
        }



React Best Practices
--------------------

+ Always enclose JSX in parenthesis. E.g.:

        var x = (<div>Example</div>);

+ Component organization:
        
        React.createClass({

            displayName: "",

            propTypes: {},
            mixins : [],

            getInitialState: function() {},
            getDefaultProps: function() {},

            componentWillMount : function() {},
            componentWillReceiveProps: function() {},
            componentWillUnmount : function() {},

            /* Your own methods */

            render : function() {}

        });

+ Always define the displayName property since it is important for debugging.

+ Methods that you are writing inside a component must begin with an underscore.

+ Always set propTypes for validation.

+ Variables containing styles must be declared at the top of everything in the render function.

+ Variables used as alias for props must be grouped.

+ Variables used as alias for state properties must be grouped.

+ You should always create an intermediate function for a function called from a prop. Example:
        
        // Parent component
        _handleEvent: function() {
            console.log("test");
        },
        render: funtion () {
            return (
                <Child onEvent=this._handleEvent>
            );
        }

        // Child component
        _handleEventInChild: function () {
            this.props.onEvent();
        },
        render: function () {
            return (
                <div onClick=this._handleEventInChild>Test</div>
            );
        }

The main reason for this approach is to have consistent bind methods in react components. Functions assigned to events directly from props will have their "this" keyword set automatically by React in the parent component, while functions defined inside the same component will have their "this" keyword setted by the bind method.
In the above example, if we wanted to bind an argument we would do:
        
    <div onClick=this._handleEventInChild.bind(this, argument)>Test</div>
Whithout the intermediate function we would have instead:
        
    <div onClick=this.onEvent.bind(null, argument)>Test</div>
In the last approach you could also use "this" instead of "null", but React would generate a warning since he already bound the "this" keyword for you.

+ Always try to use the "parent stateful children stateless" design pattern.

+ Styles must be stored in a single object variable in the render function using different properties for different styles.