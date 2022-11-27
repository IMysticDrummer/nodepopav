'use strict';

const {Advertisement, tagsPermitted}=require('./Anuncios');

module.exports={
  Advertisement: Advertisement,
  tagsPermitted: tagsPermitted,
  Usuario: require('./Usuario')
}
