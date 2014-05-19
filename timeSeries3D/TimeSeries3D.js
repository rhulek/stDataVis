var TimeSeries3D = function(dataProvider, worldWidth, worldDepth, heightBase, spotWidth, spotMaxHeight)
{
	this.dataProvider = dataProvider;
	this.worldWidth = worldWidth;
	this.worldDepth = worldDepth;
	this.heightBase = heightBase;
	this.spotWidth = spotWidth;
	this.spotMaxHeight = spotMaxHeight;

	this.displacementMap;

	this.initDisplacementMap();
}

TimeSeries3D.prototype = {

	getDisplacementMap: function()
	{
		return this.displacementMap;
	},

	initDisplacementMap: function()
	{ 
		var size = this.worldWidth * this.worldDepth;
		var displacementMap = new Uint8Array( size );
		for ( var j = 0; j < size; j ++ )
		{
			displacementMap[ j ] = this.heightBase;
		}
		this.displacementMap = displacementMap;
	},

	createSpotsByYear: function(year)
	{
		if(this.displacementMap === undefined)
		{
			throw new Error("DisplacementMap has not been created yet. Call initDisplacementMap() at first.");
		}
		//debugger;

		var latitude;
		var longitude;
		var value;
		var xy;
		var centerPoint;

		var ids = this.dataProvider.getListOfIds();
		var count = 0;
		for (var j=0; j<ids.length; j++)
		{
			if(!this.dataProvider.hasValueByIdAndYear(ids[j], year))
			{
				continue;
			}
			count++;
			latitude = this.dataProvider.getLatitudeById(ids[j]);
			longitude = this.dataProvider.getLongitudeById(ids[j]);
			value = this.dataProvider.getTransformedValueByIdAndYear(ids[j], year, this.spotMaxHeight);
			site = this.dataProvider.getSpotById(ids[j]);

			// transformace hodnot
			//value = this.dataProvider.getValueMax / value * this.spotMaxHeight;
			xy = TimeSeries3D.wgs84ToXY(latitude, longitude, this.worldWidth, this.worldDepth);
			centerPoint = TimeSeries3D.xyToIndex(xy.x, xy.y, this.worldWidth);
			// hodnota cetralniho bodu
			this.displacementMap[centerPoint] = Math.max(this.displacementMap[centerPoint], Gauss.gauss(0, value, 0, this.spotWidth)  );
			for(var i=0; i<=this.spotWidth; i++)
			{
				// gausovka v horozontalni ose
				this.displacementMap[centerPoint + i] = Math.max(this.displacementMap[centerPoint + i], Gauss.gauss(i, value, 0, this.spotWidth)  );
				this.displacementMap[centerPoint - i] = Math.max(this.displacementMap[centerPoint - i], Gauss.gauss(i, value, 0, this.spotWidth)  );
				
				// gausovka ve vertikalni ose
				this.displacementMap[centerPoint + i*this.worldWidth] = Math.max(this.displacementMap[centerPoint + i*this.worldWidth], Gauss.gauss(i, value, 0, this.spotWidth)  );
				this.displacementMap[centerPoint - i*this.worldWidth] = Math.max(this.displacementMap[centerPoint - i*this.worldWidth], Gauss.gauss(i, value, 0, this.spotWidth)  );
				//debugger;
				// gausovka v horizontalni ose o k radku posunuta
				for(var k=0; k<=this.spotWidth-i; k++)
				{
					// nad
					this.displacementMap[centerPoint + i*this.worldWidth + k]
						= Math.max(this.displacementMap[centerPoint + i*this.worldWidth + k], Gauss.gauss(k, this.displacementMap[centerPoint + i*this.worldWidth], 0, this.spotWidth)  );
					this.displacementMap[centerPoint + i*this.worldWidth - k]
						= Math.max(this.displacementMap[centerPoint + i*this.worldWidth - k], Gauss.gauss(k, this.displacementMap[centerPoint + i*this.worldWidth], 0, this.spotWidth)  );

					// pod
					this.displacementMap[centerPoint - i*this.worldWidth + k]
						= Math.max(this.displacementMap[centerPoint - i*this.worldWidth + k], Gauss.gauss(k, this.displacementMap[centerPoint - i*this.worldWidth], 0, this.spotWidth)  );
					this.displacementMap[centerPoint - i*this.worldWidth - k]
						= Math.max(this.displacementMap[centerPoint - i*this.worldWidth - k], Gauss.gauss(k, this.displacementMap[centerPoint - i*this.worldWidth], 0, this.spotWidth)  );
				}
			}
		}		
	}	
}

TimeSeries3D.xyToIndex = function (x, y, bitmapWidth)
{
	return y * bitmapWidth + x;
};

TimeSeries3D.wgs84ToXY = function (latitude, longitude, maxX, maxY)
{
	var y = Math.floor((latitude - 90) * (-1) / 180 * maxY);
	var x = Math.floor((longitude + 180) / 360 * maxX);
	return {x:x, y:y};
};
