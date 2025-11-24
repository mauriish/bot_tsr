module.exports = {
    name: "add",
    code: `$onlyForRoles[1338886551903535175;No tienes los permisos necesarios]

$setUserVar[points;$sum[$getUserVar[points;$mentioned[1];;racerstats];$message[2]];$mentioned[1];;racerstats]

$if[$sum[$getUserVar[points;$mentioned[1];;racerstats];$message[2]] >= 100;
  $giveRole[$guildID;$mentioned[1];1442350209958023198]
  $setUserVar[license;Oro;$mentioned[1];;racerstats]
  $description[1;Ascendiste a <@&1442350209958023198>!! 
  ✅ Agregaste **$message[2]** puntos a **<@$mentioned[1]>**, ahora tiene **$sum[$getUserVar[points;$mentioned[1];;racerstats];$message[2]]** puntos];
  $description[1;✅ Agregaste **$message[2]** puntos a **<@$mentioned[1]>**, ahora tiene **$sum[$getUserVar[points;$mentioned[1];;racerstats];$message[2]]** puntos]
]`
}
