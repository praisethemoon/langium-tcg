# TCG DSL

This is a short description for the TCG DSL.
The goal of the DSL is to make it easy to describe and add cards to the game.

Currently this document servers as an exploration of the DSL rather than an actual specification.

Example:
```
# this is a comment
# these fields are common between all cards
name: The King in the Mist
id: kind-in-the-mist
type: Monster
category: Dark
artwork: https://example.com/artwork.png

# these fields are unique for Monster Cards
traits: Spellcaster
attack: 500
health: 600
stars: 7
abilities:
- [active] Soul Steal: 
    - Select $target from the battlefield where $target.type = Monster
    - Effect: Destroy $target
    - [Effect] Heal for $target.health

- [passive, trigger on death] Death Wish:
    - Select $target from your hand where $target.type = Dark
    - [Effect] Summon $target

#
# these fields are unique for spell cards
ability:
    - SELECT ...
    - [Effect]

#
# these fields are unique for trap cards
trigger: 
ability:
```


DSL Description:

1. Allows for card desciption
2. Allows for querying
3. Allows for specifying commands and modeling effects in human like language
4. Is written from the perspective of current the player such as `select $x from your hand`


### Query Language:
variables starts with `$`.
1. There could be more than one query in an ability.
2. One query could also result in selecting multiple cards, such as
   1. `SELECT $targets[=3]` here it means that the selection will endup in a variable called targets, target the size has to be equal to 3. If no available effect is triggrable, the ability cannot be used.
   2. Additional syntax: 
      1. `SELECT $card` = only one card
      2. `SELECT $cards[<2]` `cards` is an array of at most two
      3. `SELECT $cards[=2]` `cards` is an array of exactly two. That becomes a requirements
3. `FROM` is fixed here, it could be: `FROM the battlefield` to select across to board, `your side of the field` , `enemy's field`, `your hand`, `enemy's hand` , `your deck`, `enemy's deck`
4. `WHERE` is used to query, it supports AND/OR, and basic mathematic operations: `WHERE ($target.attack < 400) AND ($target.attack > 100)`

A Select will prompt the game engine's state to select a card where only the ones that satisfies the constrait are selectable

### Abilities Language:
There two main types of abilities:
`passive` and `active`. 
1. Passive abilities may require some conditions to be triggered (same as traps). 
2. Active abilities can be triggered whenever the player wishes to (they may also have contraits, such as the target and such).

Effects: Effects can be chained, that why every ability effect that can be chained can be represented with [Effect].

## Language Sepcification
There are 4 specifications, while all of the same language, they depend on the card type. 

#### 1. Header:
This is a common header for all cards

```
name: identifier and special characters allowed, till \n
id: [a-zA-Z0-9_\-]+
type: Monster | Spell | Trap
category: Dark | Light | Fire | Water | Earth | Wind
artwork: a valid url
```

#### 2. Spell Cards:
A spell card is activated once and discarded, it starts immediately with a nameless ability block (because the spell name is the ability's name).

```
ability:
    - ..
    - [Effect] ..
```

#### 3. Trap Cards
A trap card lies in waiting for the right moment! 
It can be triggered if: It's conditions are satisfies AND the Player wants to.

Hence a trap card needs a trigger condition

```
trigger:
    - On Sommon $target WHERE $target.hp > 100
```

and the effect block is as usual:
```
effect:
    - SELECT
    - [effect] 
```

#### Query Language:

Let's start with some examples:

```
SELECT $target1 FROM the battlefield WHERE $target1.type = Monster
SELECT $target2 FROM your hand WHERE ($target2.attack < $target1.attack) AND ($target2.type = Spell)
```

`SELECT` cannot be nested for simplicity. In the future it might be possible to use `in` such as 
`SELECT ... WHERE $target1 in (SELECT .. )`

It is possible to use the following mathematical and logical operations, such as `AND`, `OR`, `>`, `<`, `>=`, `<=`, `!=`, `=`

Select pools: These are the pools that can be selected from.
- the battlefield
- your side of the field
- enemy's field
- your hand
- enemy's hand
- your deck
- enemy's deck
- your graveyard
- enemy's graveyard
- all graveyards

|name|description|
|---|---|
|the battlefield|Selects a card from the battlefield|
|your side of the field|Selects a card from your side of the field|
|opponents field|Selects a card from enemy's field|
|your hand|Selects a card from your hand|
|opponents hand|Selects a card from enemy's hand|
|your deck|Selects a card from your deck|
|opponents deck|Selects a card from enemy's deck|
|your graveyard|Selects a card from your graveyard|
|opponents graveyard|Selects a card from enemy's graveyard|
|all graveyards|Selects a card from all graveyards|

#### Effect language:
- The effect language is a list of commands that the game engine will execute.

| Name            | Description                                                  |
|:---------------:|--------------------------------------------------------------|
| Summon          | Summon a monster, there must be an empty slot in the field   |
| Destroy         | Send to the graveyard                                        |
| Heal for        | Heals the monster for the given amount of HP (does not reach beyond maximum life pool) |
| Recover         | Heals the players                                            |
| Increase Attack | Increases monster's attack                                   |
| Increase HP     | Increases monster's maximum life pool                        |
| Weaken Attack   | Reduces Monster's Attack Power                               |
| Weaken HP       | Reduces Monster's Life Pool                                  |
| Cancel Effect   | Cancels the effect of last card in the effect-chain          |

