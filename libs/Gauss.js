var Gauss = function()
{
};

Gauss.gauss = function(x, a, mean, sdSquared)
{
	return  a*Math.pow(Math.E, -(Math.pow(x-mean, 2)/(2*sdSquared)) );
};