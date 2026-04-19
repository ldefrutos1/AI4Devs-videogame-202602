


## 1 Selección de la tecnología ##

Which one is the best framework/library for HTML5/CSS/Javascript browser platform game for a game library [tetris clone, memory game and tangram]?


## 2 Memory Game ##
You are an expert game developer. Your task is to set up the structure for the game library and implement the first game a tipical "memory game". 
Use Phaser + TypeScript + Vite and this structure for reuse in the three final games:
/src
  /games
    /tetris
    /memory
    /tangram
  /shared
    Button.js
    ScorePanel.js
    AssetLoader.js
    GameSceneBase.js 
	
```text
##Functional requirements
###Game board
The game displays a grid of face-down cards.
Each card has exactly one matching pair.
The total number of cards must be even.
###Card flipping
The player can click or tap a card to flip it face up.
A player can flip only two cards at a time.
Already matched cards remain visible and cannot be selected again.
###Matching logic
If the two flipped cards match, they stay face up.
If they do not match, they flip back face down after a short delay.
The player cannot flip extra cards while two unmatched cards are being shown.
###Game completion
The game ends when all pairs are found.
A success message is shown when the game is completed.
###Move counter
The game counts each attempt to match two cards as one move.
The move count is displayed to the player.
###Timer
The game can track elapsed time from the first card flip.
The timer stops when all pairs are matched.
###Restart game
The player can restart the game at any time.
Restarting reshuffles the cards and resets moves, timer, and matched pairs.
###Shuffle
Cards are randomly shuffled at the start of each game.
##Non-functional requirements
###Usability
The game should be simple and easy to understand.
Cards should clearly show whether they are face down, face up, or matched.
###Responsiveness
The game should work on desktop, tablet, and mobile screens.
###Performance
Card flips and animations should feel smooth.
The game should not freeze while checking matches.
###Accessibility
Cards should be selectable by keyboard.
Images or symbols should have accessible labels.
Color should not be the only way to identify cards.
###Reliability
The game state should remain consistent.
A player should not be able to break the game by clicking quickly.
##Optional requirements
###Difficulty levels:
Easy: 4 pairs
Medium: 8 pairs
Hard: 12 or more pairs
###Score system:
Score can be based on moves and completion time.
Sound effects:
###Flip sound
Match sound
Game completed sound
##Theme selection:
Animals
Trees
Flowers
###Best score:
Store the best time or lowest number of moves locally.

Prepare a zip ready to import in VS

## Error en la ejecución ##
The cards are not displayed: Uncaught TypeError: Cannot set property state of #<Card> which has only a getter

3 ## Tetris ##
Now we are going to add a new game; Tetris

You are an expert game developer. Your task is to set up in the library the new game and allow user to choose between "Tetris" or "Memory game".

Include a Landing page to choose the game to play.
The result must be displayed properly fitted within the screen, without overlapping the footer. The layout should have a professional, modern, and polished design.

#Tetris Requirement

##Functional requirements 
###Game board
The game displays a vertical grid, traditionally 10 columns by 20 rows.
Blocks fall from the top of the board.
The board stores fixed blocks after a piece lands.
###Tetromino pieces
The game uses the 7 traditional Tetris pieces:
I
O
T
S
Z
J
L
Each piece is made of 4 blocks.
Pieces appear one at a time.
###Piece movement
The player can move the falling piece left.
The player can move the falling piece right.
The player can rotate the falling piece.
The player can move the piece down faster.
###Piece falling
The active piece automatically moves downward over time.
The falling speed increases as the game progresses.
###Collision detection
A piece cannot move outside the board.
A piece cannot move through fixed blocks.
A piece stops falling when it reaches the bottom or lands on another block.
###Locking pieces
When a piece can no longer move down, it becomes part of the board.
A new piece appears after the previous one is locked.
###Line clearing
When a horizontal row is completely filled, the row is cleared.
Rows above the cleared line move down.
Multiple rows can be cleared at once.
###Scoring
The player earns points for clearing lines.
Clearing more lines at once gives more points.
The score is displayed during the game.
###Levels
The game has levels based on progress.
Higher levels make pieces fall faster.
Next piece preview
The game shows the next piece that will appear.
###Game over
The game ends when a new piece cannot appear because the top of the board is blocked.
A game over message is displayed.
###Restart game
The player can restart the game.
Restarting resets the board, score, level, lines cleared, and current piece.
Non-functional requirements
###Usability
Controls should be simple and responsive.
The player should clearly see the current piece, fixed blocks, score, level, and next piece.
###Responsiveness
The game should work on desktop screens.
Optional mobile controls can be provided for touch devices.
###Performance
Movement, rotation, and line clearing should be smooth.
The game loop should run without freezing.
###Reliability
Fast key presses should not break the game state.
Pieces should always stay inside valid board positions.
###Accessibility
Keyboard controls should be supported.
Colors should not be the only way to distinguish pieces.
Important game messages should be readable by screen readers.
###Optional requirements
Hold piece
The player can store one piece and swap it with the current piece.
###Hard drop
The player can instantly drop the piece to the lowest valid position.
###Pause and resume
The player can pause and continue the game.
###High score
The game can store the best score locally.
###Sound effects
Move sound
Rotate sound
Line clear sound
Game over sound
###Ghost piece
Show where the current piece will land.
###Themes
Allow different colors or visual styles for the board and pieces.

```
## 3 Tangram ##

```text
#Create a Tangram puzzle game with a professional, modern, polished, and responsive design.

The objective of the game is for the user to recreate a proposed Tangram figure by moving, rotating, and placing the Tangram pieces manually.

General layout

The game screen must be divided into three vertical sections:

##1. Left section — 25% width

This section contains all the Tangram pieces before they are placed on the board.

###Requirements:

All seven Tangram pieces must start in this area when a new figure begins.
Pieces must be clearly visible and easy to select.
The user must be able to drag pieces from this section to the center play area.
The layout must avoid clutter and keep enough spacing between pieces.
Pieces should be displayed at their real playable size.

##2. Center section — 50% width

This is the main play area where the user builds the Tangram figure.

###Requirements:

The user can freely move, drag, drop, and rotate pieces inside this area.
Pieces must remain inside the playable area.
Pieces must not overlap each other.
If the user tries to place a piece over another piece, the piece should automatically move to the nearest valid non-overlapping position.
The center area must be large enough to comfortably complete the figure.
The center area must not overlap the footer or any fixed page element.
The content must fit properly on the screen.

##3. Right section — 25% width

This section displays the target figure that the user must recreate.

#Requirements:

The target figure must always remain visible while the user is playing.
The target figure must be displayed as a reduced version of the final figure.
The target figure should be shown at approximately one third of the real size of the playable Tangram pieces.
This allows the right section to be smaller than the center play area while still showing the required figure clearly.
The target figure should look clean and easy to understand.
#Tangram pieces

The game must include the seven classic Tangram pieces:

Two large triangles
One medium triangle
Two small triangles
One square
One parallelogram

#Each piece must:

Be draggable.
Be rotatable.
Be selectable.
Have clear visual feedback when selected.
Keep its correct geometric proportions.
Be rendered with a modern and polished visual style.
Piece movement and rotation

The user must be able to move the pieces manually.

#Requirements:

The user can drag pieces with the mouse or touch.
The user can rotate pieces using rotation buttons.
The user can also rotate pieces using an intuitive mouse interaction.
The rotation UX should feel smooth, simple, and natural.
A selected piece should show rotation controls close to it.
Rotation controls should not cover important parts of the board.
Rotation should respect collision rules.
If a rotation causes overlap with another piece, the game should adjust the piece to the nearest valid non-overlapping position whenever possible.
The user should always feel in control of the piece.

#Recommended UX:

When a piece is selected, show small rotate-left and rotate-right buttons near the piece.
Allow rotation in fixed angle steps suitable for Tangram puzzles, such as 15°, 45°, or 90°.
Provide smooth visual feedback while rotating or dragging.
Support both desktop mouse interaction and mobile touch interaction.
Collision and overlap rules

Pieces can be moved freely, but they must not overlap.

#Requirements:

The game must detect collisions between Tangram pieces.
Two pieces must not occupy the same space.
If the user drops a piece in an invalid overlapping position, the piece should move to the nearest valid non-overlapping position.
The piece should not simply disappear, reset unexpectedly, or block the game.
The correction should feel natural and user-friendly.
Pieces must also stay within the center play area.
Help system

The game must include a Help button.

When the user clicks the Help button:

The center play area must display a guide showing the correct solution.
The guide must include both:
The complete silhouette of the target figure.
The internal piece divisions showing where each Tangram piece should be placed.
The guide should appear in the center area, behind the movable pieces.
The guide must be clear but not intrusive.
The user must still be able to move and rotate pieces while the guide is visible.
The Help button may toggle the guide on and off.

The silhouette guide should help the user understand where the pieces should be placed without making the interface visually confusing.

#Target figures

The game must include at least 10 different Tangram target figures.

#Requirements:

Each figure must have a predefined correct solution.
Each figure must define the correct position and rotation of every Tangram piece.
The right section must show the current target figure.
The center section must use the same figure layout at full playable size.
The player should solve one figure at a time.

#Examples of possible figures:

Cat
Swan
House
Boat
Rabbit
Person
Fish
Bird
Dog
Arrow

#Game flow

The game flow must work as follows:

When the game starts, all Tangram pieces are placed in the left section.
A target figure is shown in the right section.
The center play area starts empty.
The user moves pieces from the left section into the center area.
The user can freely move and rotate pieces in the center area.
Pieces cannot overlap each other.
If the user clicks the Help button, the center area displays the silhouette and internal piece guide.
The game checks whether the user has completed the figure correctly.
The validation should allow a reasonable tolerance for position and rotation.
When the figure is completed correctly, the game shows a success message.
After success, the user can click a Next Figure button.
When the Next Figure button is clicked:
A new target figure is loaded.
All pieces return to the left section.
The center area is cleared.
The help guide is hidden by default.

#Completion validation

The game must automatically check whether the figure has been completed correctly.

#Requirements:

The game must compare each piece with its expected position and rotation.
The validation must allow some tolerance, so the user does not need pixel-perfect placement.
The tolerance should apply to:
Position
Rotation
General alignment
The game should detect completion only when all pieces are correctly placed.
When the puzzle is solved, show a clear success message.
The success message should not block the layout or overlap the footer.

#Buttons and controls

The game must include at least these controls:

Help button
Shows or hides the silhouette solution guide in the center area.
Reset button
Returns all pieces to the left section and clears the center play area.
Next Figure button
Loads the next target figure after the current one is completed.

#Optional controls:

Rotate left button.
Rotate right button.
Center piece button.
Toggle guide button.
Restart current figure button.

#Responsive design

The game must work well on both:

Desktop web browsers
Tablets and mobile devices

#Responsive requirements:

On large screens, keep the 25% / 50% / 25% three-column layout.
On smaller screens, adapt the layout so the game remains usable.
The center play area must remain the main focus.
The target figure must remain visible or easily accessible.
Controls must be large enough for touch interaction.
The game must fit within the screen without overlapping the footer.
No important element should be hidden behind fixed headers, footers, or navigation bars.

#Visual design requirements

The design must be:

Professional
Modern
Clean
Polished
Responsive
Easy to understand
Suitable for both children and adults

#Visual requirements:

Use a clean background.
Use subtle shadows or borders to separate the three areas.
Use smooth animations for dragging, dropping, rotating, and success feedback.
Use clear colors for the Tangram pieces.
Use a readable font.
Keep spacing consistent.
Avoid visual clutter.
Ensure the layout is well fitted within the screen.
Ensure the game area does not overlap the footer.
Accessibility requirements

The game should be accessible and user-friendly.

#Requirements:

Buttons must have clear labels.
The selected piece must be visually identifiable.
The Help guide must have enough contrast.
The game should not rely only on color to communicate important information.
Controls should be usable with mouse, touch, and ideally keyboard.
Success messages should be clear and readable.
Important implementation notes
The game should maintain a clean internal state for:
Current figure
Piece positions
Piece rotations
Help guide visibility
Completion status
Dragging and rotating should not break the game state.
Fast user interactions should not cause pieces to overlap or leave the playable area.
The game should feel smooth and stable.
The final result must be well fitted on the screen and must not overlap the footer.
The interface should look like a finished professional web game, not a rough prototype.
```
=================

Revisa estos puntos: 1.- no veo la opción de Tangram en el landing page 2.- No veo el botón de volver al Menu en el Memory Game 3.- En el Memory Game se superpone la fila final al pie de firma; no debería 4.- No están centrdos los botnones de la parte superior del Memory Game; centralos como el resto

=================

revisa estos temas visuales: 1.- landing page se solapan los botones y el recuadro que los contiene 2.- en memoty game pon los botones de Menu y de Restart como en tetris; uno a la izquierda y otro a la derecha 3.- Cuando hay muchas tarjetas la ultima fila se muestra encima del texto New Game. Find all matching pairs; no debe solaparse; este texto debe estar debajo 4.- se montan los elementos de la pantalla e tetris No deben solaparse 5.- No funciona el botón de Menu de tangram; debe volver al menu

Voy a trabajar sobre el último ZIP corregido y ajustar el layout de las tres pantallas, no solo cambiar posiciones puntuales. También revisaré que el botón Menu de Tangram realmente llame a la escena del landing.

Ya tengo localizados los fallos principales: en Memory el cálculo de altura de carta permitía que la carta real fuese más alta que el espacio disponible, y en Tetris el HUD móvil/compacto se colocaba debajo del tablero, provocando montajes.

Debería haberlo hecho, pero algo está fallando.

===================

Las formas de tangam no tienen derechos de autor; de todas formas te paso una web que permite imprimir plantillas gratis; saca de ahi los ejemplos https://www.educaenvivo.com/recursos-educativos-primaria/primer-ciclo/tangram-para-imprimir-gratis-pdf/


## 4 Revisión del prompt ##
Una vez que tenemos el desarrollo, estoy interesado en mejorar el proceso y los prompt. En la funcionalidad del tangram hemos tenido que ajustar varias cosas; te voy a pasar de nuevo el prompt original y quiero que actúes como el LLM que ha ejecutado el prompt y lo analices buscando puntos de corrección o mejora; después te pediré un prompt mejorado para la funcionalidad que nos hubiera permitido generar el código en menos tiempo y con mayor calidad. Pregúntame si tienes alguna duda.

```text

Puntos clave de mejora del prompt:

Faltaban assets concretos
Pedía “figuras Tangram reales”, pero no decía si debían generarse por código, usarse imágenes, PDF, SVG o plantillas proporcionadas.
Esto provocó modelos inventados o aproximados.
No distinguía claramente target vs help
Debía decir explícitamente:
Derecha: silueta reducida, sin líneas internas.
Centro con Help: misma figura a tamaño real, con divisiones internas.
Esta diferencia fue uno de los mayores focos de iteración.
“At least 10 figures” era demasiado abierto
Sin modelos exactos, el LLM eligió ejemplos genéricos.
Mejor: “usar solo estas figuras y estos archivos fuente”.
La solución geométrica estaba infraespecificada
Decía que cada figura debe tener posición y rotación, pero no daba coordenadas, escala, origen ni formato.
Para Tangram esto es crítico.
Rotación ambigua
Permitía 15°, 45° o 90°.
Debía fijar desde el inicio: “rotación en pasos de 45°”.
Faltaba giro espejo / flip
En Tangram, el paralelogramo y algunas soluciones requieren simetría.
El prompt no mencionaba “flip horizontal/vertical”.
Selección de piezas no estaba suficientemente definida
Debía especificar: una sola pieza activa, clic selecciona, solo la activa se mueve/rota, la anterior queda donde está.
La colisión era demasiado ambiciosa
“No overlap” con polígonos irregulares es complejo.
Para una primera versión habría sido mejor priorizar selección, drag, rotación, help y validación antes que corrección automática perfecta.
No incluía criterios de aceptación visuales
Faltaban checks claros: no solapes, botones alineados, footer libre, target siempre visible, help detrás de piezas.
No protegía funcionalidades existentes
Debía decir explícitamente: “No modificar Memory/Tetris salvo navegación común; ejecutar build; mantener landing funcionando”.

En resumen: el prompt era completo en intención, pero demasiado abierto en assets, geometría, interacción exacta y criterios verificables. Para Tangram, la clave era haber definido desde el principio las plantillas reales y el comportamiento exacto de Help, Target, selección, rotación y flip.
```
## 5 Prompt mejorado ##


Preparame el promt mejorado que te hubiera gustado tener
```text
You are an expert Phaser + TypeScript + Vite game developer.

We already have a Phaser game library with:
- Landing page
- Memory game
- Tetris game
- Shared components

Your task is to implement or refactor the Tangram game only.

IMPORTANT:
- Do not break Memory game.
- Do not break Tetris game.
- Do not break the landing page.
- Tangram must be accessible from the landing page.
- Tangram must have a Menu button that returns to the landing page.
- Run TypeScript/build validation before delivering the final ZIP.

==================================================
TANGRAM OBJECTIVE
==================================================

Create a Tangram puzzle game where the player recreates a target figure by manually placing the seven classic Tangram pieces.

The player must:
- Select one piece.
- Drag it from the left tray to the center board.
- Rotate it.
- Flip/mirror it if needed.
- Place it over the help template.

==================================================
LAYOUT
==================================================

The Tangram screen has three main vertical sections on desktop:

1. Left section — 25%
   - Contains the seven Tangram pieces at playable size.
   - Pieces must not overlap.
   - Pieces may be arranged in rows/columns, but spacing must be clear.
   - All pieces start here when a new puzzle begins.

2. Center section — 50%
   - Main playable area.
   - User places the pieces here.
   - Pieces must remain visible and movable.
   - This area must not overlap the footer.
   - When Help is ON, this area shows the full-size solution template behind the pieces.

3. Right section — 25%
   - Shows the current target figure.
   - This image is reduced.
   - It must never show internal piece lines.
   - It must be only the external silhouette/shape.

Responsive behavior:
- On large screens, preserve the 25 / 50 / 25 layout.
- On tablets/mobile, adapt layout to avoid overlap.
- The center board remains the main focus.
- No content may overlap the footer.

==================================================
TOP CONTROLS
==================================================

At the top of the Tangram scene:

- Menu button aligned left.
- Help On/Off button aligned right.
- Next Figure button aligned right, next to Help.

Do not include Reset unless explicitly requested.

==================================================
PIECE SET
==================================================

Use the seven classic Tangram pieces:

- 2 large triangles
- 1 medium triangle
- 2 small triangles
- 1 square
- 1 parallelogram

Each piece must:
- Be selectable.
- Be draggable.
- Be rotatable.
- Be flippable/mirrored.
- Show clear visual feedback when selected.
- Keep correct Tangram proportions.
- Use a clean, modern visual style.

==================================================
SELECTION RULES
==================================================

Selection must be deterministic and simple:

- Only one piece can be active at a time.
- When the user clicks/taps a piece, that piece becomes the active piece.
- All other pieces become inactive.
- The previously active piece remains exactly where it was.
- Only the active piece can be dragged, rotated, flipped, or moved with keyboard.
- Clicking an empty area deselects the active piece.
- Selecting a piece must not accidentally select another piece.
- Use polygon-accurate hit areas where possible, not oversized rectangles.

==================================================
DRAGGING RULES
==================================================

- The user can drag pieces with mouse or touch.
- Pieces can be dragged from the left tray into the center board.
- A piece is considered placed in the center when it intersects the center board.
- If a piece is dropped completely outside the center board, return it to a valid tray position.
- Pieces must never disappear.
- Pieces must never become unreachable.
- Fast clicks or fast drags must not corrupt the state.

==================================================
ROTATION AND FLIP RULES
==================================================

Rotation:
- Rotation must be in fixed 45-degree steps.
- Rotate left button: -45 degrees.
- Rotate right button: +45 degrees.
- Keyboard:
  - Q = rotate left 45 degrees
  - E = rotate right 45 degrees

Flip / mirror:
- Add a Flip button near the selected piece.
- Keyboard:
  - F = flip/mirror active piece
- Flip must create the symmetric version of the piece.
- Flip is required because some Tangram solutions need mirrored pieces, especially the parallelogram.

Rotation controls:
- When a piece is selected, show small controls near it:
  - Rotate left
  - Rotate right
  - Flip
- Controls must follow the selected piece.
- Controls must not block the board excessively.
- Controls must disappear when no piece is selected.

==================================================
TARGETS AND HELP TEMPLATES
==================================================

Use ONLY the provided Tangram image assets.

Do not invent additional models.
Do not use generated convex hulls as the main target.
Do not create fake Tangram figures from arbitrary coordinates unless the coordinates are explicitly provided.

The game must support exactly these figures:

- Conejo
- Cisne
- Cuadrado

Asset convention:

public/tangram/help/conejo.png
public/tangram/help/cisne.png
public/tangram/help/cuadrado.png

public/tangram/target/conejo.png
public/tangram/target/cisne.png
public/tangram/target/cuadrado.png

Help image:
- Displayed in the center board only when Help is ON.
- Full playable size.
- Shows internal Tangram piece boundaries.
- Appears behind movable pieces.
- User should be able to place the pieces directly on top of it.

Target image:
- Displayed in the right panel.
- Reduced size.
- Shows only the external silhouette.
- Must not show internal piece boundaries.
- Must remain visible while playing.

If any required image asset is missing:
- Do not silently fail.
- Show a readable placeholder message such as:
  "Template image missing: cisne"
- Keep the game usable.

==================================================
FIGURE FLOW
==================================================

When the Tangram game starts:
- Load the first figure.
- Place all seven pieces in the left tray.
- Center board is empty.
- Help is OFF by default.
- Right panel shows the reduced target image.

When Help is toggled ON:
- Show the current help template in the center board.
- Keep all movable pieces above the template.
- User can continue moving, rotating, and flipping pieces.

When Next Figure is clicked:
- Load the next figure from the exact list:
  1. Conejo
  2. Cisne
  3. Cuadrado
- Return all pieces to the left tray.
- Clear the center board state.
- Deselect active piece.
- Hide rotation/flip controls.
- Help is OFF by default.
- Update right target image.

==================================================
COMPLETION VALIDATION
==================================================

For this version, completion validation may be simple.

Preferred:
- If exact solution coordinates are provided, validate:
  - piece id
  - position tolerance
  - rotation tolerance
  - flip state

Otherwise:
- Do not fake unreliable validation.
- Provide a "Check" mechanism only if solution data exists.
- The main goal of this version is correct visual template guidance and stable manipulation.

==================================================
COLLISION RULES
==================================================

For this version:
- Avoid pieces disappearing or leaving the playable screen.
- Prevent obviously invalid placement outside the center board.
- Do not implement complex polygon collision if it makes dragging unstable.

Priority order:
1. Stable selection
2. Stable dragging
3. Stable rotation
4. Stable flip
5. Correct help/target images
6. No disappearing pieces
7. Collision refinement

==================================================
ACCESSIBILITY
==================================================

- Buttons must have clear labels.
- Selected piece must be visually obvious.
- Important messages must be readable.
- Support keyboard:
  - Q rotate left
  - E rotate right
  - F flip
  - Arrow keys move active piece
  - H toggle Help
  - N next figure
  - Esc return to Menu or deselect, depending current state

==================================================
VISUAL QUALITY
==================================================

The interface must look finished, not like a prototype.

Use:
- Clean background.
- Card-like panels.
- Subtle borders/shadows.
- Consistent spacing.
- Large enough touch controls.
- Clear active-piece highlight.
- No overlapping footer.
- No overlapping top controls.
- Responsive scaling.

==================================================
TECHNICAL REQUIREMENTS
==================================================

- Phaser + TypeScript + Vite.
- Keep reusable structure:
  /src/games/tangram
  /src/shared
- Do not rewrite unrelated games.
- Avoid hardcoded magic positions where layout helpers can be used.
- Clean internal state:
  - current figure
  - active piece
  - piece positions
  - piece rotations
  - piece flipped state
  - help visibility
- Ensure all assets are preloaded before display.
- Run:
  npm install
  npm run build
- Deliver a ZIP ready to import in VS Code.

==================================================
ACCEPTANCE CHECKLIST
==================================================

Before delivering, verify:

1. Landing page shows Tangram.
2. Menu button in Tangram returns to landing page.
3. Help and Next Figure are aligned right.
4. Menu is aligned left.
5. Only Conejo, Cisne, and Cuadrado are available.
6. Right panel always shows the target image.
7. Right panel target has no internal lines.
8. Help ON shows the large template with internal lines.
9. Help OFF hides the center template.
10. Clicking one piece activates only that piece.
11. Previously active piece stays where it was.
12. Dragging from left tray to center works.
13. Pieces do not disappear.
14. Rotate left/right works in 45-degree steps.
15. Flip works.
16. Q/E/F keyboard shortcuts work.
17. Next Figure resets pieces and loads the correct next assets.
18. Memory game still works.
19. Tetris game still works.
20. Nothing overlaps the footer.

```
