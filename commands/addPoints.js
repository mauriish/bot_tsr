module.exports = {
    name: "add",
    code: `$onlyForRoles[1338886551903535175;No tienes los permisos necesarios]

$let[newPoints;$sum[$getUserVar[points;$mentioned[1];;racerstats];$message[2]]]

$setUserVar[points;$get[newPoints];$mentioned[1];;racerstats]

$if[$get[newPoints] >= 100;
  $giveRole[$guildID;$mentioned[1];1442350209958023198] 
  $setUserVar[license;Oro;$mentioned[1];;racerstats]
  $description[1;Ascendiste a <@&1442350209958023198>!! 
  ✅ Agregaste **$message[2]** puntos a **<@$mentioned[1]>**, ahora tiene **$get[newPoints]** puntos];
  $description[1;✅ Agregaste **$message[2]** puntos a **<@$mentioned[1]>**, ahora tiene **$get[newPoints]** puntos]
]
  
`
}
