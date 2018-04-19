/**
 * Author: Maximo Mena
 * GitHub: mmenavas
 * Twitter: @menamaximo
 * Project: Memory Workout
 * Description: This is a memory game written in pure JavaScript.
 * The goal is to match pairs of cards in the least
 * number of matching attempts.
 */

/**
 * @TODO
 * - Implement support for multiple players.
 */

/**
 * @namespace The main application object
 */
var MemoryGame = {

  settings: {
    rows: 2,
    columns: 3
  },

  // Properties that indicate state
  cards: [], // Array of MemoryGame.Card objects
  attempts: 0, // How many pairs of cards were flipped before completing game
  mistakes: 0, // How many pairs of cards were flipped before completing game
  isGameOver: false,

  // images
  images: [1,100,101,102,103,104,105,106,107,108,109,11,110,111,112,113,114,115,116,117,118,119,12,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,14,140,141,142,143,144,145,146,147,148,149,15,150,151,152,153,154,155,156,157,158,159,160,161,162,164,165,166,167,168,169,17,170,171,172,173,174,175,176,177,178,179,18,180,181,182,183,184,185,186,187,188,189,19,190,191,192,193,194,195,196,197,198,199,2,20,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,24,240,241,242,243,244,245,246,247,248,249,25,250,251,252,253,254,255,256,257,258,259,26,260,261,262,263,264,265,266,267,268,269,27,270,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,286,287,288,289,29,290,291,292,293,294,295,296,297,298,299,3,300,301,302,303,304,305,306,307,308,309,31,310,311,312,313,314,32,35,36,37,39,4,41,42,43,44,46,5,52,54,56,57,58,60,61,62,63,64,65,66,67,68,69,7,70,71,73,74,75,77,78,79,80,81,82,84,85,86,87,88,89,90,91,92,93,95,96,97,98,99],

  /**
   * Modify default settings to start a new game.
   * Both parameters need integers greater than one, and
   * at least one them  needs to be an even number.
   *
   * @param {number} columns
   * @param {number} rows
   * @return {array} shuffled cards
   */
  initialize : function(rows, columns) {
    var validOptions = true;

    // Validate arguments
    if (!(typeof columns === 'number' && (columns % 1) === 0 && columns > 1) ||
        !(typeof rows === 'number' && (rows % 1) === 0) && rows > 1) {
      validOptions = false;
      throw {
        name: "invalidInteger",
        message: "Both rows and columns need to be integers greater than 1."
      };
    }

    if ((columns * rows) % 2 !== 0) {
      validOptions = false;
      throw {
        name: "oddNumber",
        message: "Either rows or columns needs to be an even number."
      };
    }

    this.shuffleImages();

    if (validOptions) {
      this.settings.rows = rows;
      this.settings.columns = columns;
      this.attempts = 0;
      this.mistakes = 0;
      this.isGameOver = false;
      this.createCards().shuffleCards();
    }

    return this.cards;
  },

  /**
   * Shuffle images
   * @return Reference to self object
   */
  shuffleImages: function() {
    var images = this.images;
    var copy = [], n = images.length, i;

    while (n) {
      i = Math.floor(Math.random() * images.length);
      if (i in images) {
        copy.push(images[i]);
        delete images[i];
        n--;
      }
    }
    this.images = copy;

    return this;
  },

  /**
   * Create an array of sorted cards
   * @return Reference to self object
   */
  createCards: function() {
    var cards = [];
    var count = 0;
    var maxValue = (this.settings.columns * this.settings.rows) / 2;
    while (count < maxValue) {
      // Card A
      cards[2 * count] = new this.Card(count + 1);
      // Card B (matching card)
      cards[2 * count + 1] = new this.Card(count + 1, true);
      count++;
    }

    this.cards = cards;

    return this;
  },

  /**
   * Rearrange elements in cards array
   * @return Reference to self object
   */
  shuffleCards: function() {
    var cards = this.cards;
    var shuffledCards = [];
    var randomIndex = 0;
    var images = this.images;

    // Shuffle cards
    while (shuffledCards.length < cards.length) {

      // Random value between 0 and cards.length - 1
      randomIndex  = Math.floor(Math.random() * cards.length);

      // If element isn't false, add element to shuffled deck
      if(cards[randomIndex]) {

        // Add random image
        cards[randomIndex].image = images[cards[randomIndex].value];

        // Add new element to shuffle deck
        shuffledCards.push(cards[randomIndex]);

        // Set element to false to avoid being reused
        cards[randomIndex] = false;
      }

    }

    this.cards = shuffledCards;

    return this;
  },

  /**
   * A player gets to flip two cards. This function returns information
   * about what happens when a card is selected
   *
   * @param {number} Index of card selected by player
   * @return {object} {code: number, message: string, args: array or number}
   */
  play: (function() {
    var cardSelection = [];
    var revealedCards = 0;
    var revealedValues = [];

    return function(index) {
      var status = {};
      var value = this.cards[index].value;

      if (!this.cards[index].isRevealed) {
        this.cards[index].reveal();
        cardSelection.push(index);
        if (cardSelection.length == 2) {
          this.attempts++;
          if (this.cards[cardSelection[0]].value !=
              this.cards[cardSelection[1]].value) {
            // No match
            this.cards[cardSelection[0]].conceal();
            this.cards[cardSelection[1]].conceal();
            /**
             * Algorithm to determine a mistake.
             * Check if the pair of at least
             * one card has been revealed before
             *
             * indexOf return -1 if value is not found
             */
            var isMistake = false;

            if (revealedValues.indexOf(this.cards[cardSelection[0]].value) === -1) {
              revealedValues.push(this.cards[cardSelection[0]].value);
            }
            else {
              isMistake = true;
            }

            if (revealedValues.indexOf(this.cards[cardSelection[1]].value) === -1) {
              revealedValues.push(this.cards[cardSelection[1]].value);
            }

            if (isMistake) {
              this.mistakes++;
            }

            revealedValues.push(this.cards[cardSelection[0]].value);

            status.code = 3,
            status.message = 'No Match. Conceal cards.';
            status.args = cardSelection;
          }
          else {
            revealedCards += 2;
            if (revealedCards == this.cards.length) {
              // Game over
              this.isGameOver = true;
              revealedCards = 0;
              revealedValues = [];
              status.code = 4,
              status.message = 'GAME OVER! Attempts: ' + this.attempts +
                  ', Mistakes: ' + this.mistakes;
            }
            else {
              status.code = 2,
              status.message = 'Match.';
            }
          }
          cardSelection = [];
        }
        else {
          status.code = 1,
          status.message = 'Flip first card.';
        }
      }
      else {
        status.code = 0,
        status.message = 'Card is already facing up.';
      }

      return status;

    };
  })()

};
