# Бабка против зомби! — комиксный пак v1
18 изолированных ассетов созданы встроенным ImageGen по выбранному зелёному зомби-варианту.
png/ — исходные PNG с прозрачностью.
webp/ — оптимизированные игровые версии (до 512 пикселей).
manifest.json — границы непрозрачной области для правильного масштаба и привязки.

Состав: бабка, внучка-кошкодевочка, базовый зомби-кот, мячемёт, колесо Мурзика,
брызгалка, шокер, когтеточка, огурец на пружине, лазерная указка, клубок,
килька-сюрприз, серебряная и золотая монеты; крыша дома, газон, дорога и изгородь.

В игре подключены бабка, основные зомби, все 9 защитных устройств и обе монеты.
Размеры и дополнительные аксессуары базовых зомби различаются по типам.
Робот, призрак, кот в коробке, хозяин и босс сохраняют специализированную
отрисовку кодом. Дом слева теперь виден сверху; газон, улица и живая изгородь используют новые ассеты. Огород пока рисуется кодом.
Внучка появилась в меню и в заставке: вместе с котами она собирает все девять устройств.
Шевеление и отдача анимируются кодом; отдельные покадровые анимации не включены.

Графика встроена в index.html, поэтому запуск скачанного HTML сохраняется.
Исходники в assets/comic/, подключение и анимация — src/assets.js.
Комиксный интерфейс использует Oswald и Balsamiq Sans с резервными шрифтами.

## Промпты дополнительных устройств
### wheel
Use case: stylized-concept. Create ONE isolated production sprite for the game 'Бабка против зомби!'. Attached image is the approved STYLE REFERENCE. Match its chunky flat hand-drawn comic style: thick irregular black ink outlines, muted mint/olive/plum/coral/cream palette, flat cel shading, simple shapes, minimal texture, cozy homemade junk devices. TRUE TRANSPARENT BACKGROUND. No text, no frame, no floor, no shadows outside sprite, no UI, no other objects, no watermark. Full object centered with 8% transparent margin, object covers 84% of image, nothing clipped. Side view with a little top visible, game device occupies a square cell, clean readable silhouette at 96px.
SUBJECT: An orange friendly healthy cat INSIDE a large vertical wooden running wheel, small mint-green dynamo attached to right side and wire, simple stout wooden triangular supports. Full assembled cat running wheel device. Cat is healthy, smiling and orange; NOT a zombie. Facing RIGHT. Wheel ring cream wood, plum shadows, brass axle.

### spr
Use case: stylized-concept. Create ONE isolated production sprite for the game 'Бабка против зомби!'. Attached image is the approved STYLE REFERENCE. Match its chunky flat hand-drawn comic style: thick irregular black ink outlines, muted mint/olive/plum/coral/cream palette, flat cel shading, simple shapes, minimal texture, cozy homemade junk devices. TRUE TRANSPARENT BACKGROUND. No text, no frame, no floor, no shadows outside sprite, no UI, no other objects, no watermark. Full object centered with 8% transparent margin, object covers 84% of image, nothing clipped. Side view with a little top visible, game device occupies a square cell, clean readable silhouette at 96px.
SUBJECT: A homemade garden water-spray turret: pale mint green squat water tank, brass hose connectors, short dark garden hose and upward angled mint sprinkler nozzle on RIGHT, coral hand crank, small wooden stand. A tiny blue water drop at nozzle, no stream. Full assembled device.

### shock
Use case: stylized-concept. Create ONE isolated production sprite for the game 'Бабка против зомби!'. Attached image is the approved STYLE REFERENCE. Match its chunky flat hand-drawn comic style: thick irregular black ink outlines, muted mint/olive/plum/coral/cream palette, flat cel shading, simple shapes, minimal texture, cozy homemade junk devices. TRUE TRANSPARENT BACKGROUND. No text, no frame, no floor, no shadows outside sprite, no UI, no other objects, no watermark. Full object centered with 8% transparent margin, object covers 84% of image, nothing clipped. Side view with a little top visible, game device occupies a square cell, clean readable silhouette at 96px.
SUBJECT: A homemade electric shock turret: two large chunky cream and coral batteries in a mint wooden crate, exposed curled red wire, brass prongs and metal spark coil angled RIGHT, tiny yellow zigzag electricity symbol as physical ornament, black bolts. Full device, no text.

### fence
Use case: stylized-concept. Create ONE isolated production sprite for the game 'Бабка против зомби!'. Attached image is the approved STYLE REFERENCE. Match its chunky flat hand-drawn comic style: thick irregular black ink outlines, muted mint/olive/plum/coral/cream palette, flat cel shading, simple shapes, minimal texture, cozy homemade junk devices. TRUE TRANSPARENT BACKGROUND. No text, no frame, no floor, no shadows outside sprite, no UI, no other objects, no watermark. Full object centered with 8% transparent margin, object covers 84% of image, nothing clipped. Side view with a little top visible, game device occupies a square cell, clean readable silhouette at 96px.
SUBJECT: A sturdy cat scratching-post BARRIER: short broad wooden plank base with two squat wooden uprights, thick beige rope wound around a horizontal stout log/post, frayed scratched rope tufts, purple little bow on left upright, warm tan/burgundy colors. Tower defense barricade, front three-quarter side view, no cat.

### cuc
Use case: stylized-concept. Create ONE isolated production sprite for the game 'Бабка против зомби!'. Attached image is the approved STYLE REFERENCE. Match its chunky flat hand-drawn comic style: thick irregular black ink outlines, muted mint/olive/plum/coral/cream palette, flat cel shading, simple shapes, minimal texture, cozy homemade junk devices. TRUE TRANSPARENT BACKGROUND. No text, no frame, no floor, no shadows outside sprite, no UI, no other objects, no watermark. Full object centered with 8% transparent margin, object covers 84% of image, nothing clipped. Side view with a little top visible, game device occupies a square cell, clean readable silhouette at 96px.
SUBJECT: A large fresh GREEN CUCUMBER mounted vertically on a coiled metal spring attached to a small square wooden base, comic bumps on cucumber skin, lean slightly RIGHT, homemade scare gadget. No face, no cat.

### laser
Use case: stylized-concept. Create ONE isolated production sprite for the game 'Бабка против зомби!'. Attached image is the approved STYLE REFERENCE. Match its chunky flat hand-drawn comic style: thick irregular black ink outlines, muted mint/olive/plum/coral/cream palette, flat cel shading, simple shapes, minimal texture, cozy homemade junk devices. TRUE TRANSPARENT BACKGROUND. No text, no frame, no floor, no shadows outside sprite, no UI, no other objects, no watermark. Full object centered with 8% transparent margin, object covers 84% of image, nothing clipped. Side view with a little top visible, game device occupies a square cell, clean readable silhouette at 96px.
SUBJECT: A chunky homemade LASER POINTER turret: a short magenta metal flashlight pointing RIGHT, dark front lens with tiny RED dot, coral switch, brass knobs, short mint-painted wooden tripod support. No laser beam, no text.

### yarn
Use case: stylized-concept. Create ONE isolated production sprite for the game 'Бабка против зомби!'. Attached image is the approved STYLE REFERENCE. Match its chunky flat hand-drawn comic style: thick irregular black ink outlines, muted mint/olive/plum/coral/cream palette, flat cel shading, simple shapes, minimal texture, cozy homemade junk devices. TRUE TRANSPARENT BACKGROUND. No text, no frame, no floor, no shadows outside sprite, no UI, no other objects, no watermark. Full object centered with 8% transparent margin, object covers 84% of image, nothing clipped. Side view with a little top visible, game device occupies a square cell, clean readable silhouette at 96px.
SUBJECT: One large PLUM PURPLE BALL OF YARN in a small shallow wooden dish, thick black ink yarn strand loops clearly visible, one loose strand coiling to the RIGHT ending outside dish. No cats or needles.

### mine
Use case: stylized-concept. Create ONE isolated production sprite for the game 'Бабка против зомби!'. Attached image is the approved STYLE REFERENCE. Match its chunky flat hand-drawn comic style: thick irregular black ink outlines, muted mint/olive/plum/coral/cream palette, flat cel shading, simple shapes, minimal texture, cozy homemade junk devices. TRUE TRANSPARENT BACKGROUND. No text, no frame, no floor, no shadows outside sprite, no UI, no other objects, no watermark. Full object centered with 8% transparent margin, object covers 84% of image, nothing clipped. Side view with a little top visible, game device occupies a square cell, clean readable silhouette at 96px.
SUBJECT: A squat mint-green SARDINE TIN with partly peeled metal lid, one little silver fish visible, short red firecracker and curled coral fuse tucked into tin, on a small wooden plank base. Homemade surprise trap. No labels, no words, no explosion.

### coin-gold
Use case: stylized-concept. Create ONE isolated production sprite for the game 'Бабка против зомби!'. Attached image is the approved STYLE REFERENCE. Match its chunky flat hand-drawn comic style: thick irregular black ink outlines, muted mint/olive/plum/coral/cream palette, flat cel shading, simple shapes, minimal texture, cozy homemade junk devices. TRUE TRANSPARENT BACKGROUND. No text, no frame, no floor, no shadows outside sprite, no UI, no other objects, no watermark. Full object centered with 8% transparent margin, object covers 84% of image, nothing clipped. Side view with a little top visible, game device occupies a square cell, clean readable silhouette at 96px.
SUBJECT: One circular GOLD PAW COIN, near-front three-quarter view, thick black contour, mustard gold rim and pale yellow golden face, dark warm gold large central paw-print symbol. Just one coin, NO device, NO floor shadow, no text.


