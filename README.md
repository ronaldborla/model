# Model

Model is a stand-alone Javascript Model to represent documents and collections of documents. A Model accepts an object and translates it into the Model's properties bound by its Schema. Models can be extended by another Model which will consequently inherit all methods and properties of the parent Model along with its constructor.

This package also includes Collection which inherits the Array prototype and transforms its items into instances based on its Model constructor. Since Collections are arrays, it can also use all methods and properties that the native Javascript array possess.

# Installation

Install via Bower

    bower install modeljs --save

# Usage

Include model.js into your application

    <script type="text/javascript" src="model.js"></script>

Create a Model depending on your requirements

    /**
     * The User Model
     * Converts raw user data to a user model
     */
    window.User = (function(Model) {
      'use strict';

      var schema = {
        first_name: String,
        last_name:  String,
        birth_date: Date
      };

      return Model(schema, define);

      ////////

      /**
       * Define User model
       */
      function define(construct, methods, virtuals, statics) {
        // ---- All methods ----
        methods.isOlderThan = isOlderThan;

        // ---- All virtual properties ----
        virtuals.age        = calculateAge;
        virtuals.full_name  = getFullName;

        // ---- All static methods/properties ----
        statics.create      = createUser;

        // Return the Constructor
        return User;

        ////////

        /**
         * The User constructor
         * It's convenient to name the constructor so that when you need to debug,
         * you can identify instances of this model as User
         */
        function User(data) {
          // Use default constructor then load user data
          construct(this).load(data);
        }

        /**
         * Calculate user's age
         */
        function calculateAge() {
          var today = new Date(),
              age = today.getFullYear() - this.birth_date.getFullYear(),
              m = today.getMonth() - this.birth_date.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < this.birth_date.getDate())) {
            age--;
          }
          return age;
        }

        /**
         * Create a User
         */
        function createUser(data) {
          return new self(data);
        }

        /**
         * Get full name
         */
        function getFullName() {
          return [this.first_name, this.last_name].join(' ');
        }

        /**
         * Check if this user is older than another user
         */
        function isOlderThan(user) {
          return this.age > user.age;
        }
      }
    })(window.Model);

Create an instance of the Model

    // Create a user
    var userA = new User({
      first_name: 'John',
      last_name:  'Doe',
      birth_date: '1988-09-29'
    });
    // or
    var userB = User.create({
      first_name: 'Jane',
      last_name:  'Doe',
      birth_date: '1989-10-14'
    });

Use the methods and properties of the Model

    // Print full name
    console.log(userA.full_name);
    // Get age
    console.log(userA.age);

    // Check who's older
    if (userB.isOlderThan(userA)) {
      console.log(userB.first_name + ' is older than ' + userA.first_name);
    } else {
      console.log(userB.first_name + ' is younger than ' + userA.first_name);
    }