# Bitclash

*Bitclash* is a web-based animated widget that turns bits into hit points and lets your Twitch viewers battle for dominance!

## Combat

Challengers get as many hit points as the number of bits in their cheer and face off against the current defender (initially the channel owner) and the defender's remaining hit points.

The challenger and the current defender take turns to fight each other until one of them is defeated. The number of hits and damage dealt are scaled according to the size of the challenger's cheer. The damage dealt is random but, without (optional) critical hits, should sum to around 105% of the challenger's cheer on average.

Critical hits, if enabled, boost a single hit's damage by a multiplier. Critical hit chance is *per match-up*; the challenger and defender will throw at most one critical hit in each fight.

If the challenger defeats the current defender then they become the new defender and (optionally) get a boost to their hit points. The defender can also heal themselves by cheering but their health cannot exceed their maximum hit points.

## Using *Bitclash*

*Bitclash* is currently registered as an application with Twitch available at http://growf.org/Bitclash
