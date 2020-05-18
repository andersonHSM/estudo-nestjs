#!/bin/bash

while getopts n:e: option
do
  case "${option}"
  in
  n) name=${OPTARG};;
  e) env=${OPTARG};;
esac
done

NODE_ENV=$env knex migrate:make --migrations-directory ./config/knex/migrations $name
