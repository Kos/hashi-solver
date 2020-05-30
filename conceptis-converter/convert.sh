#!/bin/sh
xml2json | jq '.Hashi_Puzzle|{width:.["@Width"],height:.["@Height"],data: [.Data.Island[]|{value:.["@Number"],x:.["@X"],y:.["@Y"]}]}'