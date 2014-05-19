var TimeSeries3DDataProvider = function(sourceData, spotIDAttribute, spotXAttribute, spotYAttribute, spotValueAttribute, spotTimeAttribute)
{
	this.sourceData = sourceData;
	this.spotIDAttribute = spotIDAttribute;
	this.spotXAttribute = spotXAttribute;
	this.spotYAttribute = spotYAttribute;
	this.spotValueAttribute = spotValueAttribute;
	this.spotTimeAttribute = spotTimeAttribute;
	
	this.timeSeriesByIdSite;
	this.sitesById;

	this.yearMin;
	this.yearMax;

	this.valueMax;
	this.valueMin;
	
	this._initDataProvider();
};

TimeSeries3DDataProvider.prototype = {

	_initDataProvider: function()
	{
		var yearMin;
		var yearMax;
		var valueMin;
		var valueMax;
		this.timeSeriesByIdSite = [];

		for(var i=0; i<this.sourceData.length; i++)
		{
			if(yearMin === undefined)
			{
				yearMin = this.sourceData[i][this.spotTimeAttribute];
			}
			if(yearMax === undefined)
			{
				yearMax = this.sourceData[i][this.spotTimeAttribute];
			}
			if(valueMin === undefined)
			{
				valueMin = this.sourceData[i][this.spotValueAttribute];
			}
			if(valueMax === undefined)
			{
				valueMax = this.sourceData[i][this.spotValueAttribute];
			}

			yearMin = Math.min(yearMin, this.sourceData[i][this.spotTimeAttribute]);
			yearMax = Math.max(yearMax, this.sourceData[i][this.spotTimeAttribute]);
			valueMin = Math.min(valueMin, this.sourceData[i][this.spotValueAttribute]);
			valueMax = Math.max(valueMax, this.sourceData[i][this.spotValueAttribute]);

			if(this.timeSeriesByIdSite[ this.sourceData[i][this.spotIDAttribute] ] === undefined)
			{
				this.timeSeriesByIdSite[ this.sourceData[i][this.spotIDAttribute] ] = [];
				this.timeSeriesByIdSite[ this.sourceData[i][this.spotIDAttribute] ]["timeSeries"] = [];
				this.timeSeriesByIdSite[ this.sourceData[i][this.spotIDAttribute] ]["data"] = this.sourceData[i];
			}
			this.timeSeriesByIdSite[this.sourceData[i][this.spotIDAttribute] ]["timeSeries"][ this.sourceData[i][this.spotTimeAttribute] ] = this.sourceData[i][this.spotValueAttribute];
		}

		this.yearMin = yearMin;
		this.yearMax = yearMax;
		this.valueMax = valueMax;
		this.valueMin = valueMin;
	},

	getSpotById: function(spotId)
	{
		if(this.timeSeriesByIdSite[spotId] === undefined)
		{
			throw new Error("Spot with id  " + spotId + " has not been found.");
		}
		return this.timeSeriesByIdSite[spotId]["data"];
	},

	getLatitudeById: function(spotId)
	{
		return this.getSpotById(spotId)[this.spotYAttribute];
	},

	getLongitudeById: function(spotId)
	{
		return this.getSpotById(spotId)[this.spotXAttribute];
	},

	hasValueByIdAndYear: function(spotId, year)
	{
		if(this.timeSeriesByIdSite[spotId] === undefined)
		{
			return false;
		}
		if(this.timeSeriesByIdSite[spotId]["timeSeries"][year] === undefined)
		{
			return false;
		}
		return true;
	},

	getValueByIdAndYear: function(spotId, year)
	{
		if(this.timeSeriesByIdSite[spotId] === undefined)
		{
			throw new Error("Spot with id  " + spotId + " has not been found.");
		}
		if(this.timeSeriesByIdSite[spotId]["timeSeries"][year] == undefined)
		{
			throw new Error("Spot with id  " + spotId + " and year " + year + " has not been found.");	
		}
		return this.timeSeriesByIdSite[spotId]["timeSeries"][year];
	},

	getTransformedValueByIdAndYear: function(spotId, year, valueMaxLimit)
	{
		var value = this.getValueByIdAndYear(spotId, year);
		return value / this.valueMax  * valueMaxLimit;
	}, 

	getListOfIds: function()
	{
		var ids = [];
		for(var id in this.timeSeriesByIdSite)
		{
			ids.push(id);
		}
		return ids;
	},

	getValueMax: function()
	{
		return this.valueMax;
	}

};