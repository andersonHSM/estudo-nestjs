#!/bin/bash

while getopts n:e: option
do
  case "${option}"
  in
  n) name=${OPTARG};;
  e) env=${OPTARG};;
esac
done

knex migrate:make --knexfile ./src/config/knex/knexfile.ts --migrations-directory ./config/knex/migrations --env $env --name $name
