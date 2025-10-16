var juego = new Phaser.Game(410,255, Phaser.CANVAS,'juego2d');

var tecladoArriba;
var tecladoAbajo;
var tecladoDerecha;
var tecladoIzquierda;
var persona;
var fondo;
var musicaFondo;
var sonidoItem;
var musicaSecreta;
var musicaIniciada = false;
var enAreaSecreta = false; 

var estadoPrincipal={
    preload: function(){
        juego.load.image('fondo','img/bg2.png');
        juego.load.image('fondo2','img/bg.jpeg');
        juego.load.spritesheet('persona','img/persona2.png',64,64);
        juego.load.spritesheet('objeto', 'img/coin.png', 200, 171);
        // Cargamos los archivos de audio
        juego.load.audio('musica', 'sounds/musica-fondo.mp3');
        juego.load.audio('coin', 'sounds/coin.mp3');
        juego.load.audio('musica_secreta', 'sounds/musica-secreta.mp3');
        // fondo secreto
        juego.load.image('fondo_secreto', 'img/bg-secret.jpg');
    },
    create: function(){
        // Habilitamos el sistema de físicas Arcade
        juego.physics.startSystem(Phaser.Physics.ARCADE); // <-- Habilitamos las físicas

        fondo = juego.add.tileSprite(0,0,410,255,'fondo');

        // Creamos el objeto y le damos físicas
        objeto = juego.add.sprite(100, 100, 'objeto'); // <-- Creamos el objeto en la posición (100, 100)
        juego.physics.arcade.enable(objeto); // <-- Le damos físicas al objeto
        objeto.scale.setTo(0.25, 0.25)
        // <-- AJUSTE DEL HITBOX DEL OBJETO
        // (ancho, alto, desplazamientoX, desplazamientoY)
        objeto.body.setSize(80, 150, 38, 15); 
        objeto.animations.add('brillar', null, 6, true);
        objeto.animations.play('brillar');
        
        persona = juego.add.sprite(juego.width-20, juego.height-90, 'persona');
        persona.anchor.setTo(0.5);
        juego.physics.arcade.enable(persona); // <-- Le damos físicas al jugador
        // <-- AJUSTE DEL HITBOX DE LA PERSONA
        // (ancho, alto, desplazamientoX, desplazamientoY)
        persona.body.setSize(32, 48, 15, 12)
        persona.animations.add('arriba',[12,13,14,15],10,true);
        persona.animations.add('abajo',[0,1,2,3],10,true);
        persona.animations.add('derecha',[8,9,10,11],10,true);
        persona.animations.add('izquierda',[4,5,6,7],10,true);

        tecladoArriba= juego.input.keyboard.addKey(Phaser.Keyboard.UP);
        tecladoAbajo= juego.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        tecladoDerecha= juego.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        tecladoIzquierda= juego.input.keyboard.addKey(Phaser.Keyboard.LEFT);

        // <-- AÑADIMOS EL TEXTO AQUÍ
        // Definimos el estilo del texto (fuente, tamaño, color).
        var estiloTexto = { font: "16px Arial", fill: "#ffffff" };
        
        // Creamos el objeto de texto.
        var textoFirma = juego.add.text(juego.width / 2, juego.height - 20, "Por: Diego Fernando Gallardo Cueva", estiloTexto);
        
        // Anclamos el texto en su centro para que quede perfectamente centrado.
        textoFirma.anchor.setTo(0.5);
        // Añadimos y reproducimos los sonidos
        // Guardamos los sonidos en las variables que declaramos antes
        musicaFondo = juego.add.audio('musica');
        sonidoItem = juego.add.audio('coin');
        musicaSecreta = juego.add.audio('musica_secreta');
        musicaFondo.loop = true;
        musicaSecreta.loop = true;
    },
    update: function(){
        if (!enAreaSecreta) {
            fondo.tilePosition.x -= 1;
        }

        // Verificamos si el jugador se superpone con el objeto y llamamos a la función 'agarrarObjeto'
        juego.physics.arcade.overlap(persona, objeto, this.agarrarObjeto, null, this); // <-- Detectamos la colisión

         // LÓGICA PARA INICIAR LA MÚSICA CON LA PRIMERA INTERACCIÓN
        if (!musicaIniciada && (tecladoArriba.isDown || tecladoAbajo.isDown || tecladoDerecha.isDown || tecladoIzquierda.isDown)) {
            musicaFondo.play();
            musicaIniciada = true; // Ponemos la bandera en true para que no se ejecute de nuevo
        }

        if (!enAreaSecreta && persona.x <= (persona.width / 2)) {
            this.entrarAreaSecreta(); // Llamamos a nuestra nueva función
        }

        if(tecladoArriba.isDown){
            persona.position.y -=2;
            persona.animations.play('arriba');
        }else if(tecladoAbajo.isDown){
            persona.position.y +=2;
            persona.animations.play('abajo');
        }else if(tecladoDerecha.isDown){
            persona.position.x +=2;
            persona.animations.play('derecha');
        }else if(tecladoIzquierda.isDown){
            persona.position.x -=2;
            persona.animations.play('izquierda');
        }

        if (!tecladoArriba.isDown && !tecladoAbajo.isDown && 
            !tecladoDerecha.isDown && !tecladoIzquierda.isDown) {
            persona.animations.stop();
        }
    },
    // <-- Esta es la nueva función que se ejecuta al tocar el objeto
    agarrarObjeto: function(jugador, item) {
        sonidoItem.play();
        // Eliminamos el objeto para que no se pueda agarrar de nuevo
        item.kill();

        // Cambiamos la textura del fondo
        fondo.loadTexture('fondo2');

        // Reseteamos la posición del jugador al centro
        jugador.x = juego.width / 2;
        jugador.y = juego.height / 2;
    },
    /*
    render: function() {
        // Dibuja un cuadro verde alrededor del hitbox de cada objeto
        juego.debug.body(persona);
        juego.debug.body(objeto);
    }*/
   entrarAreaSecreta: function() {
        // Ponemos la bandera en true para que esto solo se ejecute una vez
        enAreaSecreta = true;
        // CAMBIAMOS LA MÚSICA
        musicaFondo.stop();
        musicaSecreta.play();
        // Cambiamos la imagen de fondo por la del área secreta
        fondo.loadTexture('fondo_secreto');
        // Nos aseguramos de que el nuevo fondo no se mueva
        fondo.tilePosition.x = 0;

        // Eliminamos la moneda del juego
        objeto.kill();
        
        // Movemos al jugador al otro lado de la pantalla, como si entrara por la derecha
        persona.x = juego.width - (persona.width / 2);
    }
};
juego.state.add('principal', estadoPrincipal);
juego.state.start('principal');