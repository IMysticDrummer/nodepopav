# NODEPOP

### Iván García Rodríguez

Práctica de desarrollo backend **avanzado** para keepcoding web13.  
Mejora del API de desarrollo backend. Resueltas las indicaciones del profesor sobre la primera versión:

- Inicializador de la base de datos en el package.json
- El API devueve siempre los errores en formato JSON

API del portal de anuncios de compra-venta de segunda mano.  
Listar, filtrar, paginar y ordenar desde la URL.  
Crear a través de petición post.  
Servir archivos por llamado directo desde la URL.  
Web básica mostrando los anuncios.

**Nuevas características**  
El API sube archivos de fotos para los anuncios cuando se crean.  
El campo **foto** es **obligatorio** para crear un anuncio.

El API de Nodepop proporciona un microservicio que crea thumbnails de las fotos subidas (_Thumbnailer_). Dichas fotos son guardadas en el directorio `/public/images/thumbnails`.  
Thumbnailer creará el directorio cuando haga la primera conversión.

# PRERREQUISITOS PARA USAR LA APLICACIÓN

Es necesario tener instalado mongodb.

## Clonar el repositorio en local

Repositorio:  
[Nodepopav](https://github.com/IMysticDrummer/nodepopav.git)

## Instalar dependencias

No olvidar instalar las dependencias con el comando `npm install`.

## Crear un archivo de entorno

Seguir lo siguientes pasos:

1. Copiar el archivo .env.example como .env
2. Editar el archivo .env
3. Rellenar los campos **obligatorios** :

   - **DB_URL**: Es la cadena de conexión con la base de datos mongodb
   - **JWT_SECRET**: Es la cadena de firma privada que utilizará el servidor para generar las claves y tokens
   - _PORT_: Esta clave es opcional, en caso de querer que la aplicación corra por otro puerto diferente al 3000

## Base de datos

La base de datos se llamará `nodepop`.  
La colección se llamará `advertisements`.  
Asegurar que el archivo `anunciosBase.json` está disponible cuando se ha clonado el repositorio.  
**Correr el comando `npm run initdb`**  
El script se encargará de crear los índices necesarios, y subir los anuncios.
También creará un **primer usuario**: user@example.com, con _password_ 1234.

# Arranque de la aplicación

**Arranque en producción de todos los servicios (incluyendo thumbnailer): `npm start`**  
_Arranque de los servicios por separado_:

- `npm run startNodepop` --> Arranca sólo la aplicación, sin el thumbnailer.
- `npm run startThumbnailer` --> Arranca sólo el thumbNailer, sin la aplicación.

Modo desarrollo en windows: `npm run devWin`  
Modo desarrollo en plataformas linux: `npm run dev`

**Problemas en el arranque**  
Este es un defecto **ya solucionado.**  
Sin embargo, en el cado de que después de arrancar todos los servicios, al intentar entrar en la dirección base de la página web (http://localhost:3000), aparece algún error de usuario no encontrado, **borrar las cookies del navegador**, y volver a intentarlo.

**Modos de test**

- `npm run test`: ejecuta el "supertest" general. La prueba de generación de anuncios está deshabilitada, para no subir anuncios de prueba.
- `npm run test:watch`: inicia el modo de vigilancia de supertest  
  Se incluye en este paquete el fichero `output-test-file`, donde está guardado el resultado del último test completo de la aplicación, antes de su puesta en el repositorio. Este fichero cotiene el coverage de la prueba completa.

# USO DEL API

## Documentación API en línea

Una vez arrancada la aplicación, se puede acceder a http://localhost:3000/api-docs para documentación swagger en línea.

## Propósito

Este API devuelve el listado de anuncios de Nodepop en formato JSON, compuesto por la clave `results`, que cotiene un array de objetos.  
Los campos a devolver se pueden seleccionar (ver la sección _peticiones al api_), aunque por defecto son:

- **\_id**: del artículo en la base de datos
- **nombre**: (del artículo)
- **venta**: indica si el artículo está en venta o si alguién está buscando ese artículo
- **precio**
- **foto**: nombre del archivo de la foto del artículo, que se puede obtener directamente a través de [http://localhost:3000/images/anuncios/]_nombrearchivo_
- tags: array con el/los tags de tipo asociados al artículo.
- **\_\_v**: versionado del documento

## Peticiones al api

---

### Autenticado

Antes de hacer cualquier petición al API, es necesario obtener el token de autenticación.  
Es necesario realizar una petición tipo POST a http://localhost:3000/api/login, enviando los datos email: _email_usuario_ y password: _password_usuario_, en el body de la petición.  
Si el usuario está registrado, el API responderá con un objeto JSON que contendrá el token del usuario, válido para dos días.

```JSON
  {
    "token": "string"
  }
```

Este token será necesario para realizar todas las operaciones de obtención y creación de anuncios que se envíen al API.  
El token será proporcionado en query string:  
`?token=TOKEN`  
o bien en la cabecera de la petición con la clave _Authorization_:  
`Authorization: TOKEN`  
**Ojo** ... no es un _bearer token_. Enviarlo como tal no permite las operaciones.

### Listado completo de anuncios

`http://localhost:3000/api/anuncios`

### Filtros permitidos

Sobre la dirección anterior se permiten los siguientes
filtros en línea:

- **nombre=** _texto_ --> búsqueda por el nombre del artículo  
  Como **mejora**, el texto se buscará en el campo completo
  del nombre, no sólo por la palabra con la que empieza.  
  Además, buscará patron, por lo que no hace falta poner
  la palabra completa. Esto permitirá mejorar la experiencia de búsqueda del utilizador en el APY y la página web, con búsquedas más abiertas.  
  _Este campo es insensible a búsqueda en mayúsculas o minúsculas._  
  _Ejemplo:_ `nombre=pho` devolverá tanto iPhone, como mobile phone, como phonetic.
- **venta=**(_true_ o _false_) --> búsqueda de artículos en venta (_true_) o de artículos que se buscan (_false_).  
  Admite tanto valores true y false, como 1 y 0.
- **tag=** _texto_ --> texto a buscar entre los tags de los anuncios

  - Sólo hay permitidos 4 tags:
    - lifestyle
    - mobile
    - motor
    - work

  _Este campo es insensible a búsqueda en mayúculas o minúsculas_, pero **requiere la palabra exacta**.

- **precio=** _cadena_ --> Busca por rangos de precio. El formato de la _cadena_ es (siempre sin espacios):

  - _number_ --> P.e: `50` --> Busca los articulos de precio exacto
  - _number_- --> P.e: `30-` --> Busca los artículos a partir del precio 30
  - _number_-_number_ --> P.e: `20-100` --> Busca los artículos de precio a partir de 20 y hasta 100 incluido
  - -_number_ --> P.e: `-60` --> Busca los artículos de precio hasta 60

  **nota**: El número del precio sólo está limitado a que sea un número convertible a integer.
  Cualquier cifra integer es permitida.  
  Si se introduce una cifra con punto o coma, se
  tendrá en cuenta sólo la parte entera.

### Otros modificadores

Sobre la dirección principal, y de la misma forma que se indican los filtros, se pueden aplicar otros modificadores a la consulta.

- **Paginación**
  - skip=_number_ --> Inidica cuantos de los resultados obtenidos de la base de datos saltarse en el resultado
  - limit=_number_ --> Indica cuantos resultados se deben devolver
- **Ordenación**
  - sort=_campo_ --> Indica por qué campo realizar la ordenación de los resultados. Los campos posibles son:
    - nombre
    - precio
    - venta
- **Selección de campos a devolver**
  - fields=_cadena_ --> la cadena indica los campos a presentar, separdos por `+`. Si no se desea el \_id de la base de datos, añadir `%20-_id`.  
    Ejemplo:  
    `http://localhost:3000/api/?fields=nombre+precio%20-_id`  
    Esto devolverá el listado de artículos sólo con los campos nombre y precio.
    _No olvides incluir el token_

---

## Imágenes

Para acceder a las imágenes de los anuncios, basta con añadir a la dirección principal de la URL, el resultado del campo **foto**.  
Por ejemplo, si el campo foto indica `/images/anuncios/bici.jpeg`, la dirección de acceso a la foto será:  
`http://localhost:3000/images/anuncios/bici.jpeg`.

---

## Número de elementos por tag permitido

Devuelve un objeto con los tags permitidos y cuantos anuncios de cada tag hay contenidos en la base de datos  
`http://localhost:3000/api/alltags`  
**Atención:** no confundir con la llamada para obtener los
anuncios que contengan un determiando tag, que sería  
`http://localhost:3000/api/?tag=...` o
`http://localhost:3000/api?tag=...`

---

## Creación de anuncios

Mediante método POST se deben aportar todos los campos.
En este casso, todos están requeridos en la base de datos,
por lo que es obligatorio llenarlos.

- **nombre** --> campo que debe contener un string con el nombre del anuncio
- **venta** --> campo que debe contener un booleano. Puede ser true, false, 0 o 1.
  False o 0 significa que se está buscando ese artículo y el presupueto  
  True o 1 significa que el artículo se pone a la venta por ese precio
- **precio** --> el precio de venta del artículo, o el presupuesto de búsqueda del mismo.  
  **_Atención:_** El separador de decimales se hace con **`.`**
- **foto**: nombre del archivo que contiene la foto del anuncio. Debe ser una imagen en formato jpeg, bmp, png, tiff o giff. Cualquier otro formato resultará en un error de creación del anuncio.
- **tags**: debe ser un string, en el caso de que sea un sólo valor, o un array de strings en el caso de varios tags asociados al anuncio.  
  **_Atención_**: los valores permitidos son los mismos indicados anteriormente en este manual. La API controla tanto el formato como el contenido.

Cuando el anuncio esté creado, el API responderá con un código 201 y un objeto con un mensaje de "anuncio correctamente creado".

---

## Errores

En caso de producirse errores en el paso de cualquier dato al API, este devolverá un objeto de error.
Si el fallo es debido a algún dato mal introducido, o faltante (cuando se intenta crear un anuncio), el API responderá con un código 422, además de con un objeto que contendrá el mensaje de error y el lugar dónde se cometío (query o body).

En casos de errores por validación de un sólo dato, el API devolverá el objeto de error completo.

Cualquier fallo no detectado, rogamos se pongan en contacto para su descripción y resolución.

---

# PÁGINA WEB

Bajo la dirección `http://localhost:3000` el servidor mostrará una página web de testeo, dónde se mostraran los
anuncios contenidos en la base de datos.
Para acceder a dicha página, debe realizarse un **inicio de sesión** con el mismo email y contraseña que se utiliza para el API.  
En este caso utilizamos una sesión con cookie, por lo que las peticiones de filtrado y paginación realizadas en la URL, no es necesario pasarles token.

Se pueden aplicar los mismos filtros que en la API, sin poner `/api` en la URL, para probar el funcionamiento de la misma, y filtrar.
los anuncios. Por ejemplo:  
`http://localhost:3000/?precio=50-&sort=precio` --> Muestra los artículos mayores e iguales de 50 de precio, ordenados por precio.
