#Tiny HTML5 Music Player
 
####Trying to keep it simple and under 10KB with no dependencies.

Tiny HTML5 Music Player is lightweight music player with no *dependencies*. You just need a modern HTML5 compatible browser such as Chrome, Firefox or IE9 and later.

If you want to generate waveforms for your MP3 you can use [SoX](http://sox.sourceforge.net/) and [gnuplot](http://www.gnuplot.info/), both available for free on Linux, Windows and OSX.

####Bash script to generate waveforms for all MP3 in the current directory:
```Bash
#!/bin/bash
# Generates waveforms of all mp3 in current folder
# PNG resolution: 980 x 60
# Dependencies: sox and gnuplot

FILES="./*.mp3"

for f in $FILES
do
	sox $f -G -r 4000 -c 1 test.dat && tail -n+3 test.dat > test.datclean

	gnuplot -p -e "set terminal png transparent size 980,60 enhanced; set yr [-1:1]; unset key; unset tics; unset border; set lmargin 0; set rmargin 0; set tmargin 0; set bmargin 0; set output '$f.png'; plot 'test.datclean' using 1:2 every 50 with lines lc rgbcolor '#000000'"
done

rm test.dat
rm test.datclean
```

##Usage:

Import both tinyplayer.css and tinyplayer.js and add the following script to your page:
```JavaScript
TrackList = 
	[
		{
			url:'http://www.mrt-prodz.com/public/mp3/whwd.mp3',
			title:'What Have We Done',
			year:'2007'
		},
		{
			url:'http://www.mrt-prodz.com/public/mp3/right-of-stupidity.mp3',
			title:'Right of Stupidity',
			year:'2004'
		}
	];
//player([tracklist], [show waveform?], [show help?])
tinyplayer(TrackList, true, true);
```

All you have to do is add a div tag with the id 'all_tracks', HTML sample:
```HTML
<!DOCTYPE html>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>Tiny HTML5 Music Player by Themistokle Benetatos</title>
<link rel="stylesheet" media="all" type="text/css" href="./css/tinyplayer.css">
<script src="./js/tinyplayer.js"></script>
<script>
	TrackList = 
		[
			{
				url:'http://www.mrt-prodz.com/public/mp3/whwd.mp3',
				title:'What Have We Done',
				year:'2007'
			},
			{
				url:'http://www.mrt-prodz.com/public/mp3/right-of-stupidity.mp3',
				title:'Right of Stupidity',
				year:'2004'
			}
		];
		
	//Make a player and display help
	//player([tracklist], [show waveform?], [show help?])
	tinyplayer(TrackList, true, true);
</script>
</head>
<body>
	<div class="wrapper">
		<h2>Tiny HTML5 Mp3 Player</h2>
		<div id="all_tracks"></div>
	</div>
</div>
</body>
</html>
```

##Screenshot:
![Tiny HTML5 Music Player](https://raw.githubusercontent.com/mrt-prodz/Tiny-HTML5-Music-Player/master/screenshot.jpg)