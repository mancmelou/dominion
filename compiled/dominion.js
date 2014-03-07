var Dominion = (function () {  "use strict";  var Cards = (function () {    /**     * IMPORTANT     *     * `play` and `end` will be called with     * `apply` against the Player object     */    return {      "Copper": {        name: "Copper",        type: "Treasure",        cost: 0,        play: function () {          this.addCoins(1);        }      },      "Silver": {        name: "Silver",        type: "Treasure",        cost: 3,        play: function () {          this.addCoins(2);        }      },      "Gold": {        name: "Gold",        type: "Treasure",        cost: 6,        play: function () {          this.addCoins(3);        }      },      "Estate": {        name: "Estate",        type: "Victory",        cost: 2,        end:  function () {          this.add_victory(1);        }      },      "Duchy": {        name: "Duchy",        type: "Victory",        cost: 5,        end:  function () {          this.add_victory(3);        }      },      "Province": {        name: "Province",        type: "Victory",        cost: 8,        end:  function () {          this.add_victory(6);        }      },      "Curse": {        name: "Curse",        type: "Curse",        cost: 0,        end:  function () {          this.add_victory(-1);        }      },      "Cellar": {        name: "Cellar",        type: "Action",        cost: 2,        play: function () {          this.add_actions(1);          this.discard_any_cards();          this.replace_discarded_cards();        }      },      "Chapel":  {        name: "Chapel",        type: "Action",        cost: 2,        play: function () {          this.trash_up_to(4);        }      },      "Moat": {        name:   "Moat",        type:   "Action - Reaction",        cost:   2,        immune: true,        play:   function () {          this.draw_cards(2);        }      },      "Chancellor": {        name: "Chancellor",        type: "Action",        cost: 3,        play: function () {          this.add_coins(2);          this.discard_deck();        }      },      "Village": {        name: "Village",        type: "Action",        cost: 3,        play: function () {          this.draw_cards(1);          this.add_actions(2);        }      },      "Woodcutter": {        name: "Woodcutter",        type: "Action",        cost: 3,        play: function () {          this.add_buys(1);          this.add_coins(2);        }      },      "Workshop": {        name: "Workshop",        type: "Action",        cost: 3,        play: function () {          this.gain_card_costing_up_to(4);        }      },      "Bureaucrat": {        name: "Bureaucrat",        type: "Action - Attack",        cost: 4,        play: function () {          this.bureaucrat();        }      },      "Feast": {        name: "Feast",        type: "Action",        cost: 4,        play: function () {          this.trash_this_card();          this.gain_card_costing_up_to(5);        }      },      "Gardens": {        name: "Gardens",        type: "Victory",        cost: 4,        end:  function () {          this.gardens();        }      },      "Militia": {        name: "Militia",        type: "Action - Attack",        cost: 4,        play: function () {          this.add_coins(2);          this.other_players_discard_down_to(3);        }      },      "Moneylender": {        name: "Moneylender",        type: "Action",        cost: 4,        play: function () {          this.trash_copper_for_coins(3);        }      },      "Remodel": {        name: "Remodel",        type: "Action",        cost: 4,        play: function () {          this.trash_card_for_card_costing_more(3);        }      },      "Smithy": {        name: "Smithy",        type: "Action",        cost: 4,        play: function () {          this.draw_cards(3);        }      },      "Spy": {        name: "Spy",        type: "Action - Attack",        cost: 4,        play: function () {          this.spy();        }      },      "Thief": {        name: "Thief",        type: "Action - Attack",        cost: 4,        play: function () {          this.thief();        }      },      "ThroneRoom": {        name: "ThroneRoom",        type: "Action",        cost: 4,        play: function () {          this.chose_card_play_it_twice();        }      },      "CouncilRoom": {        name: "CouncilRoom",        type: "Action",        cost: 5,        play: function () {          this.draw_cards(4);          this.buy_points(1);          this.other_players_draw_cards(1);        }      },      "Festival": {        name: "Festival",        type: "Action",        cost: 5,        play: function () {          this.add_actions(2);          this.add_buys(1);          this.add_coins(2);        }      },      "Laboratory": {        name: "Laboratory",        type: "Action",        cost: 5,        play: function () {          this.draw_cards(2);          this.add_actions(1);        }      },      "Library": {        name: "Library",        type: "Action",        cost: 5,        play: function () {          this.library();        }      },      "Market": {        name: "Market",        type: "Action",        cost: 5,        play: function () {          this.draw_cards(1);          this.add_actions(1);          this.add_buys(1);          this.add_coins(1);        }      },      "Mine": {        name: "Mine",        type: "Action",        cost: 5,        play: function () {          this.mine();        }      },      "Witch": {        name: "Witch",        type: "Action - Attack",        cost: 5,        play: function () {          this.draw_cards(2);          this.other_players_get_curse_card();        }      },      "Adventurer": {        name: "Adventurer",        type: "Action",        cost: 6,        play: function () {          this.adventurer();        }      }    };  }());  var Board = (function () {    var Board =  {      kingdom: {}, // kingdom cards aka available cards      trashed: [], // cards that are trashed      onBoard: [], // visible cards that are placed on the board      init: function (gamePreset) {        this.reset();        if (gamePreset === undefined || gamePreset === "firstGame") {          this.pickFirstGameKingdomCards();        }        this.pickVictoryAndTreasureCards();        return this;      },      reset: function () {        this.onBoard = [];        this.trashed = [];        this.kingdom = {};      },      clear: function () {        this.onBoard = [];      },      pickVictoryAndTreasureCards: function () {        var infinity = 1.0/0;        this.kingdom["Estate"]   = 8;        this.kingdom["Duchy"]    = 8;        this.kingdom["Province"] = 8;        this.kingdom["Curse"]    = 10;        this.kingdom["Copper"] = infinity;        this.kingdom["Silver"] = infinity;        this.kingdom["Gold"]   = infinity;        return this;      },      pickFirstGameKingdomCards: function () {        var firstGameCards = [          "Cellar", "Market", "Militia", "Mine", "Moat", "Remodel",          "Smithy", "Village", "Woodcutter", "Workshop"        ];        for (var i = 0; i < firstGameCards.length; i++) {          this.kingdom[firstGameCards[i]] = 25;        }        return this;      }    };    return Board;  }());  var Player = (function () {    var Hand = {      reset: function () {        this.actions = 1;        this.buys    = 1;        this.coins   = 0;        this.cards   = [];        return this;      },      canBuyCard: function (cardCost) {        return this.buys > 0 && this.coins >= cardCost;      }    };    var Player = {      Hand:         null,      Board:        null,      drawPile:    [],      discardPile: [],      /**       *  Initializers and resetters       */      init: function () {        this.Hand  = Hand;        this.Board = Board;        this.Cards = Cards;        this.Board.init();        this.firstHand();        return this;      },      resetHand: function () {        this.Hand.reset();      },      cleanBoard: function () {        this.Board.clear();      },      firstHand: function () {        this.drawPile = [          "Estate", "Estate", "Estate", "Copper", "Copper",          "Copper", "Copper", "Copper", "Copper", "Copper"        ];        this.shuffleDrawPile();        this.resetHand();        this.nextHand();      },      /**       *  Turn interactions       */      nextHand: function () {        for (var i = 0; i < 5; i++) {          this.drawCard();        }        return this;      },      endOfTurn: function () {        this.moveHandToDiscardPile();        this.nextHand();        return this;      },      shuffleDrawPile: function () {        var counter = this.drawPile.length,            temp,            index;        while (counter > 0) {          index    = Math.floor(Math.random() * counter);          counter -= 1;          temp = this.drawPile[counter];          this.drawPile[counter] = this.drawPile[index];          this.drawPile[index]   = temp;        }      },      moveDiscardPileToDrawPile: function () {        this.drawPile    = this.discardPile;        this.discardPile = [];        this.shuffleDrawPile();      },      moveHandToDiscardPile: function () {        for (var i = 0; i < this.Hand.cards.length; i++) {          this.discardPile.push(this.Hand.cards[i]);        }        this.resetHand();        for (var i = 0; i < this.Board.onBoard.length; i++) {          this.discardPile.push(this.Board.onBoard[i]);        }        this.cleanBoard();        return this;      },      isDrawPileEmpty: function () {        return this.drawPile.length === 0;      },      moveCardFromHandToBoard: function (cardIndex) {        this.Board.onBoard.push(this.Hand.cards.splice(cardIndex, 1));      },      drawCard: function () {        if (this.isDrawPileEmpty()) {          this.moveDiscardPileToDrawPile();        }        var card = this.drawPile.shift();        if (card) {          this.Hand.cards.push(card);        }        return this;      },      playCard: function (card) {        var cardIndex = this.Hand.cards.indexOf(card);        if (cardIndex !== -1) {          this.moveCardFromHandToBoard(cardIndex);          this.Cards[card].play.apply(this);        } else {          throw card + " card cannot be played as it's not part of your hand";        }        return this;      },      buyCard: function (card) {        if (this.Hand.buys > 0 && this.Hand.coins >= Cards[card].cost) {          this.Hand.buys  -= 1;          this.Hand.coins -= 1;          // take the new card into the discard pile          return true;        }        return false;      },      /**       * Card interactions       */      addCoins: function (n) {        this.Hand.coins += n;      },      addActions: function (n) {        this.Hand.actions += n;      },      addBuys: function (n) {        this.Hand.buys += n;      },      /* Debug helpers */      debug: function () {        return {          draw:    this.drawPile,          hand:    this.Hand.cards,          discard: this.discardPile,          board:   {            kingdom: this.Board.kingdom,            trashed: this.Board.trashed,            onBoard: this.Board.onBoard          }        };      }    };    return Player;  }());  //test  //Player.init();  //Player.endOfTurn().nextHand().endOfTurn().nextHand();  //Player.debug();  return Player;}());