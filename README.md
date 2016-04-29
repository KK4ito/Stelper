# Stelper
Student Helper Single Page Application für WebeC von:

Irina Terribilini, Lukas Willin, Emil Sturzenegger

## Inhalt
* Informationen
    * Relevante Dateien/Ordner
* Installation
* Grunt Tasks
* Yeoman Subgenerators
* Libraries hinzufügen
    * Bower
    * Npm
* Less (Styling)
* Build Prozess

## Informationen
Als Referenz gelten grundsätzlich folgende Links:

* [https://github.com/cgross/generator-cg-angular](Generator)

### Relevante Dateien/Ordner
Folgende Dateien und Ordner sind von Relevanz (mit diesen arbeiten):

* client
    * modules (Hier werden alle Dateien hinein generiert)
    * app.js
    * app.less
    * index.html
* .gitignore
* README.md

Alle anderen können so belassen werden wie sie sind.

## Installation
Installiere NodeJS (npm wird davon nacher benötigt):

Installiere Grunt/Yeoman/Bower:

    npm install -g grunt-cli yo bower

Installiere den Angular Generator: 

    npm install -g generator-cg-angular

Clone das Projekt in einen Ordner deiner Wahl.

Installiere alle Komponenten (Wechsle zuerst in den geklonten Projekt Ordner):

    bower install && npm install

## Grunt Tasks
Grunt ist ein Entwicklungs Tool zum Testen und Builden von Projekten.

    grunt serve     #Startet einen Entwicklungsserver. Benutzt diesen um einfach auszuporobieren
    grunt test      #Startet alle Unit tests
    grunt build     #Erstellt ein voll optimierten Ordner /dist für die Produktion

Wenn ```grunt serve``` gestartet wird, werden sämtliche Änderungen am Code live im Browser angezeigt.

## Yeoman Subgenerators
Yeoman ist ein Komplex aus verschiedenen Tools zusammen. Es generiert Standart Dateien und erleichtert so die Arbeit. Zudem kann man so die Projektstruktur sauber halten.
Folgende Befehle sind hier zur Verfügung:

    yo cg-angular:directive my-awesome-directive    # Mit diesem kann man eigene Attribute/Elemente erstellen
    yo cg-angular:partial my-partial                # Erstellt ein View mit Controller (das VC aus MVC)
    yo cg-angular:service my-service                # Erstellt ein Model (das M aus MVC)
    yo cg-angular:filter my-filter                  # Erstellt einen Filter
    yo cg-angular:module my-module                  # Erstellt ein "Modul". Agiert als Vater von Partials --> Nicht brauchen
    yo cg-angular:modal my-modal                    # Erstellt ein Modal (Popover)

## Libraries hinzufügen
Zu Beginn muss klar unterschieden werden wann man ```bower install ...``` und wann ```npm install ...``` brauchen muss.
Bower wird immer dann gebraucht, wenn man ein Frontend Plugin installieren will.
Npm (kommt mit der Node.js installation) wird immer dann gebraucht, wenn man ein NodeJS Paket (meist ein Kern Feature oder Backend Feature) installieren will.

Grund: Wenn man die Ordnerstruktur von node_modules anschaut (das ist der Ort wo npm alles installiert), stellt man fest dass dieser enorm tief geht.
Das hätte zur Folge dass wenn man Frontend Elemente laden will, diese sehr lange brauchen. Jedoch hat npm seine Vorteile: 
Es kann mehrere Instanzen/Versionen einer Bibliothek installieren, wodurch ältere wie auch neuere Abhängigkeiten zu anderen Bibliotheken abgedeckt werden können.

### Bower
Suche nach Bibliotheken: [http://bower.io/search/](bower)

Beim hinzufügen einer Bower Bibliothek muss ein \<script\> und wenn benötigt ein \<style\> manuell im index.html hinzugefügt werden.
Die zu verlinkenden Dateien sind im Ordner bower_components zu finden.

### Npm
Suche nach Bibliotheken: [https://www.npmjs.com/](npm)

## Less (Styling)
Less ist eine Art "Scriptsprache" die CSS erweitert. Mit ihr können Variabeln oder auch Funktionen gesetzt werden mit dem Vorteil, 
dass diese dann nach dem Kompilieren zugewiesen/ausgeführt werden.
Somit müssen Styles nicht mühselig einzeln angepasst werden.

Bsp.: Mann will eine Farbpalette für die Applikation erstellen.
Definiert im app.less (global) und somit geltend für alle anderen .less
    
    @dark-stelper-red: #990000
    @light-stelper-red: #ff8080
    
Nutzung

    .meine-klasse {
        background-color: @light-stelper-red;
    }

Beim ```grunt serve/build``` werden alle .less files kompiliert zu einem Stylesheet.

## Build Prozess
Was macht überhaupt ```grunt build``` genau?

Siehe hier: [https://github.com/cgross/generator-cg-angular\#build-process](BuildProzess)
