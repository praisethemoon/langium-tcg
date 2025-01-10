# TCG DSL

This is a Langium DSL for describing cards for a TCG.

The language is designed to be easy to use and understand, allowing for non programmers to easily add cards to the game.
The goal is to model not only a Card's characteristics, but also its abilities and effects.

<img src="./assets/ifrit-demo.png" width="300">

The source of this card can be found in `/samples/000.card`


Card abilities are modeled as `selection` and `effect` steps.

1. A Selection step is a step which prompts to player to select a target within the game, where to target must satisfy a set of conditions.
2. An Effect step is a step which instructs the game to perform an action.

Effect steps can be chained, meaning players can react to them.

The DSL is modeled for a Yu Gi Oh like TCG, where players can have monster cards, spell cards, and trap cards.
The language also models UI element such as Card description, artwork, and abilities' names and descriptions.

## Mechanics
```
name: "The King in the Mist" 
id: 1
type: monster
category: dark
artwork: "https://www.cardgameart.org/wp-content/uploads/2024/01/The-King-in-the-Mist.jpg"
traits: spellcaster
attack: 1000
health: 1000
stars: 7
description: "A powerful creature, really."
abilities:
    [active] "Rally":
        description: "Select a 'Dark' monster from your hand and summon it to your side of the field"
        select $card from opponents hand where ($card.type = monster)
        [effect] summon $card
```

In this example, when the player activates the "Rally" ability, they will need to select a monster from their hand who's type is `dark` and then summon it to their side of the field.

If the opponent has a trap, that has an activation condition of `on summon`, the player can activate the trap.

An example of such a trap would be:

```
name: "I don't think so!" 
id: 1
type: trap
category: dark
artwork: "https://www.cardgameart.org/wp-content/uploads/2024/01/The-King-in-the-Mist.jpg"
trigger: trigger on opponent summon $card where (($card.type = monster) and ($card.attack >= 500))
effect: 
    description: "When the opponent summons a monster with 500 or more attack, destroy it."
    [effect] destroy $card
```

## Notes

The assumption is that the game will handle deeper type checking, for instance

```
select $cards[=3] from the battlefield where ($cards.type = monster)
```

Will select 3 cards, but during selection, `$target` is treated as a card object

The following scenario is not yet implemented in validatio phase:

```
select $firstCards[=2] from deck where ($firstCards.type = monster)
select $secondCards from deck where ($secondCards.attack <= $firstCards[0].attack)
```

The idea here is that during selection, any variable declared is a previous selection shoud theoretically be checked 
since now it is used as a value and not a query object.

## Testing
There is no game prototype yet, but you can export `.card` to `.json` using langium's JSON Serializer.
```
node bin/cli.js samples/000.card -d ./samples/samples_serialized/
```


## TODO:
- Add tests `/tests/*`
- Game prototype