module.exports = {
    name: "add",
    code: `$onlyForRoles[1338886551903535175;No tienes los permisos necesarios]
$setUserVar[points;$sum[$getUserVar[points;$mentioned[1];;racerstats];$message[2]];$mentioned[1];;racerstats]
✅ Agregaste **$message[2]** puntos a **<@$mentioned[1]>**, ahora tiene **$sum[$getUserVar[points;$mentioned[1];;racerstats];$message[2]]** puntos
`
}
