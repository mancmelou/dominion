var Dominion = (function () {
  "use strict";

  var Cards = (function () {
    /**
     * IMPORTANT
     *
     * `play will be called with
     * `apply` against the Player object
     */
    var Cards =  {
      "Copper": {
        name: "Copper",
        type: "Treasure",
        cost: 0,
        play: function () {
          this.addCoins(1);
        }
      },
      "Silver": {
        name: "Silver",
        type: "Treasure",
        cost: 3,
        play: function () {
          this.addCoins(2);
        }
      },
      "Gold": {
        name: "Gold",
        type: "Treasure",
        cost: 6,
        play: function () {
          this.addCoins(3);
        }
      },
      "Estate": {
        name: "Estate",
        type: "Victory",
        cost: 2
      },
      "Duchy": {
        name: "Duchy",
        type: "Victory",
        cost: 5
      },
      "Province": {
        name: "Province",
        type: "Victory",
        cost: 8
      },
      "Curse": {
        name: "Curse",
        type: "Curse",
        cost: 0
      },
      "Cellar": {
        name: "Cellar",
        type: "Action",
        cost: 2,
        play: function () {
          Player.addActions(1);

          return function (cards) {
            if (!Game.getPendingAction()) {
              throw "Invalid pending action";
            }

            if (!(cards instanceof Array)) {
              throw "Invalid list of cards";
            }

            for (var i = 0; i < cards.length; i++) {
              Player.discardCard(cards[i]);
              Player.drawCard();
            }

            Game.removePendingAction();
          };
        }
      },
      "Chapel":  {
        name: "Chapel",
        type: "Action",
        cost: 2,
        play: function () {
          return function (cards) {
            if (!Game.getPendingAction()) {
              throw "Invalid pending action";
            }

            if (!(cards instanceof Array)) {
              throw "Invalid list of cards";
            }

            if (cards.length > 4) {
              throw "Invalid number of cards to trash";
            }

            for (var i = 0; i < cards.length; i++) {
              Player.trashCard(cards[i]);
            }

            Game.removePendingAction();
          };
        }
      },
      "Moat": {
        name:   "Moat",
        type:   "Action - Reaction",
        cost:   2,
        immune: true,
        play:   function () {
          this.drawCard();
          this.drawCard();
        }
      },
      "Chancellor": {
        name: "Chancellor",
        type: "Action",
        cost: 3,
        play: function () {
          this.addCoins(2);

          return function (answer) {
            if (!Game.getPendingAction()) {
              throw "Invalid pending action";
            }

            if (answer === 1) {
              Player.moveDiscardPileToDrawPile();
              Player.shuffleDrawPile();
            }

            Game.removePendingAction();
          };
        }
      },
      "Village": {
        name: "Village",
        type: "Action",
        cost: 3,
        play: function () {
          this.drawCard();
          this.addActions(2);
        }
      },
      "Woodcutter": {
        name: "Woodcutter",
        type: "Action",
        cost: 3,
        play: function () {
          this.addBuys(1);
          this.addCoins(2);
        }
      },
      "Workshop": {
        name: "Workshop",
        type: "Action",
        cost: 3,
        play: function () {
          return function (card) {
            if (!Game.getPendingAction()) {
              throw "Invalid pending action";
            }

            if (Cards[card].cost > 4) {
              throw card + " must not cost more than 4";
            }

            Player.gainCard(card);
          };
        }
      },
      "Bureaucrat": {
        name: "Bureaucrat",
        type: "Action - Attack",
        cost: 4,
        play: function () {
          Player.gainCard("Silver", "drawPile");
          // multiplayer; each other player shows a victory card
          // or their whole hand
        }
      },
      "Feast": {
        name: "Feast",
        type: "Action",
        cost: 4,
        play: function () {
          this.trashCard("Feast");
          return function (card) {
            if (!Game.getPendingAction()) {
              throw "Invalid pending action";
            }

            if (Cards[card].cost >= 5) {
              throw card + " does not cost up to 5";
            }

            Player.gainCard(card);
            Game.removePendingAction();
          };
        }
      },
      "Gardens": {
        name: "Gardens",
        type: "Victory",
        cost: 4
      },
      "Militia": {
        name: "Militia",
        type: "Action - Attack",
        cost: 4,
        play: function () {
          this.addCoins(2);
          // this.otherPlayersDiscardDownTo(3);
        }
      },
      "Moneylender": {
        name: "Moneylender",
        type: "Action",
        cost: 4,
        play: function () {
          this.trash_copper_for_coins(3);
        }
      },
      "Remodel": {
        name: "Remodel",
        type: "Action",
        cost: 4,
        play: function () {
          return function (oldCard, newCard) {
            if (!Game.getPendingAction()) {
              throw "Invalid pending action";
            }

            if (Cards[newCard].cost > Cards[oldCard].cost + 2) {
              throw newCard + " does not cost up to +2 more than " + oldCard;
            }

            Player.trashCard(oldCard);
            Player.gainCard(newCard);

            Game.removePendingAction();
          };
        }
      },
      "Smithy": {
        name: "Smithy",
        type: "Action",
        cost: 4,
        play: function () {
          this.drawCard();
          this.drawCard();
          this.drawCard();
        }
      },
      "Spy": {
        name: "Spy",
        type: "Action - Attack",
        cost: 4,
        play: function () {
          this.spy();
        }
      },
      "Thief": {
        name: "Thief",
        type: "Action - Attack",
        cost: 4,
        play: function () {
          this.thief();
        }
      },
      "ThroneRoom": {
        name: "ThroneRoom",
        type: "Action",
        cost: 4,
        play: function () {
          this.chose_card_play_it_twice();
        }
      },
      "CouncilRoom": {
        name: "CouncilRoom",
        type: "Action",
        cost: 5,
        play: function () {
          this.drawCards();
          this.drawCards();
          this.drawCards();
          this.drawCards();
          this.addBuys(1);
          // this.other_players_draw_cards(1);
        }
      },
      "Festival": {
        name: "Festival",
        type: "Action",
        cost: 5,
        play: function () {
          this.addActions(2);
          this.addBuys(1);
          this.addCoins(2);
        }
      },
      "Laboratory": {
        name: "Laboratory",
        type: "Action",
        cost: 5,
        play: function () {
          this.drawCard();
          this.drawCard();
          this.addActions(1);
        }
      },
      "Library": {
        name: "Library",
        type: "Action",
        cost: 5,
        play: function () {
          //this.library();
        }
      },
      "Market": {
        name: "Market",
        type: "Action",
        cost: 5,
        play: function () {
          this.drawCard();
          this.addActions(1);
          this.addBuys(1);
          this.addCoins(1);
        }
      },
      "Mine": {
        name: "Mine",
        type: "Action",
        cost: 5,
        play: function () {
          return function (oldCard, newCard) {
            if (!Game.getPendingAction()) {
              throw "Invalid pending action";
            }

            if (Cards[oldCard].type !== "Treasure") {
              throw oldCard + " is not a treasure card";
            }

            if (Cards[newCard].type !== "Treasure") {
              throw newCard + " is not a treasure card";
            }

            if (Cards[newCard].cost > Cards[oldCard].cost + 3) {
              throw newCard + " does not cost up to +3 more than " + oldCard;
            }

            Player.trashCard(oldCard);
            Player.gainCard(newCard);
          };
        }
      },
      "Witch": {
        name: "Witch",
        type: "Action - Attack",
        cost: 5,
        play: function () {
          this.drawCard();
          this.drawCard();
          //this.other_players_get_curse_card();
        }
      },
      "Adventurer": {
        name: "Adventurer",
        type: "Action",
        cost: 6,
        play: function () {
          //this.adventurer();
        }
      }
    };

    return Cards;
  }());

  var Board = (function () {
    var Board =  {
      kingdom: {}, // kingdom cards aka available cards
      trashed: [], // cards that are trashed
      onBoard: [], // visible cards that are placed on the board

      init: function (gamePreset) {
        this.reset();

        if (gamePreset === undefined || gamePreset === "firstGame") {
          this.pickFirstGameKingdomCards();
        }

        this.pickVictoryAndTreasureCards();

        return this;
      },
      reset: function () {
        this.onBoard = [];
        this.trashed = [];
        this.kingdom = {};
      },
      clear: function () {
        this.onBoard = [];
      },
      takeKingdomCard: function (card) {
        if (!this.kingdom[card]) {
          throw card + " is not part of the kingdom cards";
        }

        if (this.kingdom[card] <= 0) {
          throw "Card out of supply";
        }

        this.kingdom[card] -= 1;
      },
      pickVictoryAndTreasureCards: function () {
        var infinity = 1.0/0;

        this.kingdom["Estate"]   = 8;
        this.kingdom["Duchy"]    = 8;
        this.kingdom["Province"] = 8;
        this.kingdom["Curse"]    = 10;

        this.kingdom["Copper"] = infinity;
        this.kingdom["Silver"] = infinity;
        this.kingdom["Gold"]   = infinity;
      },
      pickFirstGameKingdomCards: function () {
        var firstGameCards = [
          "Cellar", "Market", "Militia", "Mine", "Moat", "Remodel",
          "Smithy", "Village", "Woodcutter", "Workshop"
        ];

        for (var i = 0; i < firstGameCards.length; i++) {
          this.kingdom[firstGameCards[i]] = 10;
        }
      }
    };

    return Board;
  }());

  var Player = (function () {
    var Player = {
      phase:       "wait", // can be action phase, buy phase, wait
      drawPile:    [],
      discardPile: [],
      hand:        [],
      actions:     1,
      buys:        1,
      coins:       0,

      /**
       *  Initializers and resetters
       */
      init: function () {
        this.dealInitialHand();

        return this;
      },
      clearHand: function () {
        this.actions = 1;
        this.buys    = 1;
        this.coins   = 0;
        this.hand    = [];
      },
      clearBoard: function () {
        Board.clear();
      },
      dealInitialHand: function () {
        this.drawPile = [
          "Estate", "Estate", "Estate", "Copper", "Copper",
          "Copper", "Copper", "Copper", "Copper", "Copper"
        ];

        this.shuffleDrawPile();
        this.clearHand();
        this.drawNextHand();
      },

      /**
       *  Turn interactions
       */
      drawNextHand: function () {
        for (var i = 0; i < 5; i++) {
          this.drawCard();
        }
      },
      endOfTurn: function () {
        this.moveCardsToDiscardPile();
        this.drawNextHand();
        this.switchToActionPhase();
      },
      shuffleDrawPile: function () {
        var counter = this.drawPile.length,
            temp,
            index;

        while (counter > 0) {
          index    = Math.floor(Math.random() * counter);
          counter -= 1;

          temp = this.drawPile[counter];

          this.drawPile[counter] = this.drawPile[index];
          this.drawPile[index]   = temp;
        }
      },
      moveDiscardPileToDrawPile: function () {
        this.drawPile    = this.discardPile;
        this.discardPile = [];

        this.shuffleDrawPile();
      },
      moveCardsToDiscardPile: function () {
        for (var i = 0; i < this.hand.length; i++) {
          this.discardPile.push(this.hand[i]);
        }

        this.clearHand();

        for (var i = 0; i < Board.onBoard.length; i++) {
          this.discardPile.push(Board.onBoard[i]);
        }

        this.clearBoard();
      },
      isDrawPileEmpty: function () {
        return this.drawPile.length === 0;
      },
      moveCardFromHandToBoard: function (cardIndex) {
        Board.onBoard.push(this.hand.splice(cardIndex, 1).pop());
      },
      moveCardFromHandToDiscardPile: function (cardIndex) {
        this.discardPile.push(this.hand.splice(cardIndex, 1).pop());
      },
      drawCard: function () {
        if (this.isDrawPileEmpty()) {
          this.moveDiscardPileToDrawPile();
        }

        this.hand.push(this.drawPile.shift());
      },
      discardCard: function (card) {
        var cardIndex = this.hand.indexOf(card);

        if (cardIndex !== -1) {
          this.moveCardFromHandToDiscardPile(cardIndex);
        } else {
          throw card + " card cannot be discarded as it's not part of your hand";
        }
      },
      trashCard: function (card) {
        var cardIndex = this.hand.indexOf(card);

        if (cardIndex !== -1) {
          Board.trashed.push(this.hand.splice(cardIndex, 1).pop());
        } else {
          throw card + " card cannot be trashed as it's not part of your hand";
        }
      },
      playCard: function (card) {
        var cardIndex = this.hand.indexOf(card);

        if (cardIndex !== -1) {
          if (Cards[card].type !== "Treasure") {
            if (this.phase === "buy") {
              throw "Cannot play action card in buy phase";
            }

            this.takeActions(1);
          } else if (Cards[card].type === "Treasure") {
            this.switchToBuyPhase();
          }

          this.moveCardFromHandToBoard(cardIndex);

          if (Cards[card].play) {
            return Cards[card].play.apply(this);
          }
        } else {
          throw card + " card cannot be played as it's not part of your hand";
        }
      },
      buyCard: function (card) {
        if (this.buys < 1) {
          throw "Not enough buy points";
        }

        if (this.coins < Cards[card].cost) {
          throw "Not enough treasure points";
        }

        Board.takeKingdomCard(card);

        this.takeBuys(1);
        this.takeCoins(Cards[card].cost);

        this.discardPile.push(card);
      },
      gainCard: function (card, destination) {
        Board.takeKingdomCard(card);

        if (destination === undefined || !destination) {
          destination = "hand";
        }

        this[destination].unshift(card);
      },
      playMoney: function () {
        var i = 0;
        var j = this.hand.length;

        do {
          if (Cards[this.hand[i]].type === "Treasure") {
            this.playCard(this.hand[i]);

            i = 0; j = this.hand.length;

            continue;
          }

          i++;
        } while (i < j);

        this.switchToBuyPhase();
      },
      switchToWaitPhase: function (phase) {
        this.phase = "wait";
      },
      switchToActionPhase: function (phase) {
        this.phase = "action";
      },
      switchToBuyPhase: function (phase) {
        this.phase = "buy";
      },

      /**
       * Card interactions
       */
      addCoins: function (n) {
        this.coins += n;
      },
      addActions: function (n) {
        this.actions += n;
      },
      addBuys: function (n) {
        this.buys += n;
      },
      takeCoins: function (n) {
        this.coins -= n;
      },
      takeActions: function (n) {
        this.actions -= n;
      },
      takeBuys: function (n) {
        this.buys -= n;
      }
    };

    return Player;
  }());

  var Game = (function () {
    var interaction = null;

    var Game = {
      context: function () {
        // make a copy for each of these properties 
        // so the user cannot modify the original values
        return {
          kingdom: Board.kingdom,
          board:   Board.onBoard,
          trash:   Board.trashed,
          draw:    Player.drawPile,
          discard: Player.discardPile,
          hand:    Player.hand,
          actions: Player.actions,
          buys:    Player.buys,
          coins:   Player.coins,
          phase:   Player.phase
        };
      },
      start: function (cardListOrPresetName) {
        Board.init(cardListOrPresetName);
        Player.init();
      },
      play: function (card) {
        if (interaction instanceof Function) {
          throw "Call interaction() to get a callback to continue"
        }

        return interaction = Player.playCard(card) || null;
      },
      playMoney: function () {
        Player.playMoney();
      },
      buy: function (card) {
        Player.buyCard(card);
      },
      endOfTurn: function () {
        this.removePendingAction();
        Player.endOfTurn();
      },
      interaction: function () {
        return interaction;
      },
      removeInteraction: function () {
        interaction = null;
      },
      quit: function () {
      }
    };

    return Game;
  }());

  return Game;
}());

Dominion.start();
Dominion.play('Copper');
Dominion.play('Copper');
Dominion.buy('Cellar');
Dominion.endOfTurn();
Dominion.endOfTurn();
Dominion.context();
try {
  Dominion.play('Cellar');
} catch (e) {
  Dominion.endOfTurn();
  Dominion.play('Cellar');
}
