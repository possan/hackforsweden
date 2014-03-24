/* 
 * Reimplementation of Arnold Andreassons "Gauss Conformal Projection 
 * (Transverse Mercator), Krügers Formulas". 
 * 
 * Reimplementation work started from Björn Sållarps .NET code
 *
 * v0.01 - Author Marcus Kempe
 *
 * Example usage (WGS84 to SWEREF99TM):
 *
 * var pos = new WGS84Position(56.626271,16.242655);
 * var swerefpos = pos.toSWEREF99TM();
 * console.log(swerefpos)
 *
 */

/*
 * MightyLittleGeodesy 
 * RT90, SWEREF99 and WGS84 coordinate transformation library
 * 
 * Read my blog @ http://blog.sallarp.com
 * 
 * 
 * Copyright (C) 2009 Björn Sållarp
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this 
 * software and associated documentation files (the "Software"), to deal in the Software 
 * without restriction, including without limitation the rights to use, copy, modify, 
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to 
 * permit persons to whom the Software is furnished to do so, subject to the following 
 * conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or 
 * substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING 
 * BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND 
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, 
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/*
 * .NET-implementation of "Gauss Conformal Projection 
 * (Transverse Mercator), Krügers Formulas".
 * - Parameters for SWEREF99 lat-long to/from RT90 and SWEREF99 
 * coordinates (RT90 and SWEREF99 are used in Swedish maps).
 * 
 * The calculations are based entirely on the excellent
 * javscript library by Arnold Andreassons.
 * Source: http://www.lantmateriet.se/geodesi/
 * Source: Arnold Andreasson, 2007. http://mellifica.se/konsult
 * Author: Björn Sållarp. 2009. http://blog.sallarp.com
 */

function GaussKreuger(){
    this.axis;
    this.flattening;
    this.central_meridian;
    this.scale; 
    this.false_northing;
    this.false_easting;

    this.swedish_params = function(projection){
        // RT90 parameters, GRS 80 ellipsoid.
        if (projection == "rt90_7.5_gon_v")
        {
            this.grs80_params();
            this.central_meridian = 11.0 + 18.375 / 60.0;
            this.scale = 1.000006000000;
            this.false_northing = -667.282;
            this.false_easting = 1500025.141;
        }
        else if (projection == "rt90_5.0_gon_v")
        {
            this.grs80_params();
            this.central_meridian = 13.0 + 33.376 / 60.0;
            this.scale = 1.000005800000;
            this.false_northing = -667.130;
            this.false_easting = 1500044.695;
        }
        else if (projection == "rt90_2.5_gon_v")
        {
            this.grs80_params();
            this.central_meridian = 15.0 + 48.0 / 60.0 + 22.624306 / 3600.0;
            this.scale = 1.00000561024;
            this.false_northing = -667.711;
            this.false_easting = 1500064.274;
        }
        else if (projection == "rt90_0.0_gon_v")
        {
            this.grs80_params();
            this.central_meridian = 18.0 + 3.378 / 60.0;
            this.scale = 1.000005400000;
            this.false_northing = -668.844;
            this.false_easting = 1500083.521;
        }
        else if (projection == "rt90_2.5_gon_o")
        {
            this.grs80_params();
            this.central_meridian = 20.0 + 18.379 / 60.0;
            this.scale = 1.000005200000;
            this.false_northing = -670.706;
            this.false_easting = 1500102.765;
        }
        else if (projection == "rt90_5.0_gon_o")
        {
            this.grs80_params();
            this.central_meridian = 22.0 + 33.380 / 60.0;
            this.scale = 1.000004900000;
            this.false_northing = -672.557;
            this.false_easting = 1500121.846;
        }

        // RT90 parameters, Bessel 1841 ellipsoid.
        else if (projection == "bessel_rt90_7.5_gon_v")
        {
            this.bessel_params();
            this.central_meridian = 11.0 + 18.0 / 60.0 + 29.8 / 3600.0;
        }
        else if (projection == "bessel_rt90_5.0_gon_v")
        {
            this.bessel_params();
            this.central_meridian = 13.0 + 33.0 / 60.0 + 29.8 / 3600.0;
        }
        else if (projection == "bessel_rt90_2.5_gon_v")
        {
            this.bessel_params();
            this.central_meridian = 15.0 + 48.0 / 60.0 + 29.8 / 3600.0;
        }
        else if (projection == "bessel_rt90_0.0_gon_v")
        {
            this.bessel_params();
            this.central_meridian = 18.0 + 3.0 / 60.0 + 29.8 / 3600.0;
        }
        else if (projection == "bessel_rt90_2.5_gon_o")
        {
            this.bessel_params();
            this.central_meridian = 20.0 + 18.0 / 60.0 + 29.8 / 3600.0;
        }
        else if (projection == "bessel_rt90_5.0_gon_o")
        {
            this.bessel_params();
            this.central_meridian = 22.0 + 33.0 / 60.0 + 29.8 / 3600.0;
        }
        // SWEREF99TM and SWEREF99ddmm  parameters.
        else if (projection == "sweref_99_tm")
        {
            this.sweref99_params();
            this.central_meridian = 15.00;
            this.scale = 0.9996;
            this.false_northing = 0.0;
            this.false_easting = 500000.0;
        }
        else if (projection == "sweref_99_1200")
        {
            this.sweref99_params();
            this.central_meridian = 12.00;
        }
        else if (projection == "sweref_99_1330")
        {
            this.sweref99_params();
            this.central_meridian = 13.50;
        }
        else if (projection == "sweref_99_1500")
        {
            this.sweref99_params();
            this.central_meridian = 15.00;
        }
        else if (projection == "sweref_99_1630")
        {
            this.sweref99_params();
            this.central_meridian = 16.50;
        }
        else if (projection == "sweref_99_1800")
        {
            this.sweref99_params();
            this.central_meridian = 18.00;
        }
        else if (projection == "sweref_99_1415")
        {
            this.sweref99_params();
            this.central_meridian = 14.25;
        }
        else if (projection == "sweref_99_1545")
        {
            this.sweref99_params();
            this.central_meridian = 15.75;
        }
        else if (projection == "sweref_99_1715")
        {
            this.sweref99_params();
            this.central_meridian = 17.25;
        }
        else if (projection == "sweref_99_1845")
        {
            this.sweref99_params();
            this.central_meridian = 18.75;
        }
        else if (projection == "sweref_99_2015")
        {
            this.sweref99_params();
            this.central_meridian = 20.25;
        }
        else if (projection == "sweref_99_2145")
        {
            this.sweref99_params();
            this.central_meridian = 21.75;
        }
        else if (projection == "sweref_99_2315")
        {
            this.sweref99_params();
            this.central_meridian = 23.25;
        }
        else
        {
            this.central_meridian = null;
        }
    };

    // Sets of default parameters.
    this.grs80_params = function()
    {
        this.axis = 6378137.0; // GRS 80.
        this.flattening = 1.0 / 298.257222101; // GRS 80.
        this.central_meridian = null;
    };

    this.bessel_params = function()
    {
        this.axis = 6377397.155; // Bessel 1841.
        this.flattening = 1.0 / 299.1528128; // Bessel 1841.
        this.central_meridian = null;
        this.scale = 1.0;
        this.false_northing = 0.0;
        this.false_easting = 1500000.0;
    };

    this.sweref99_params = function()
    {
        this.axis = 6378137.0; // GRS 80.
        this.flattening = 1.0 / 298.257222101; // GRS 80.
        this.central_meridian = null;
        this.scale = 1.0;
        this.false_northing = 0.0;
        this.false_easting = 150000.0;
    };

    // Conversion from geodetic coordinates to grid coordinates.
    this.geodetic_to_grid = function(latitude, longitude)
    {
        var x_y = []

        // Prepare ellipsoid-based stuff.
        var e2 = this.flattening * (2.0 - this.flattening);
        var n = this.flattening / (2.0 - this.flattening);
        var a_roof = this.axis / (1.0 + n) * (1.0 + n * n / 4.0 + n * n * n * n / 64.0);
        var A = e2;
        var B = (5.0 * e2 * e2 - e2 * e2 * e2) / 6.0;
        var C = (104.0 * e2 * e2 * e2 - 45.0 * e2 * e2 * e2 * e2) / 120.0;
        var D = (1237.0 * e2 * e2 * e2 * e2) / 1260.0;
        var beta1 = n / 2.0 - 2.0 * n * n / 3.0 + 5.0 * n * n * n / 16.0 + 41.0 * n * n * n * n / 180.0;
        var beta2 = 13.0 * n * n / 48.0 - 3.0 * n * n * n / 5.0 + 557.0 * n * n * n * n / 1440.0;
        var beta3 = 61.0 * n * n * n / 240.0 - 103.0 * n * n * n * n / 140.0;
        var beta4 = 49561.0 * n * n * n * n / 161280.0;

        // Convert.
        var deg_to_rad = Math.PI / 180.0;
        var phi = latitude * deg_to_rad;
        var lambda = longitude * deg_to_rad;
        var lambda_zero = this.central_meridian * deg_to_rad;

        var phi_star = phi - Math.sin(phi) * Math.cos(phi) * (A +
                        B * Math.pow(Math.sin(phi), 2) +
                        C * Math.pow(Math.sin(phi), 4) +
                        D * Math.pow(Math.sin(phi), 6));
        var delta_lambda = lambda - lambda_zero;
        var xi_prim = Math.atan(Math.tan(phi_star) / Math.cos(delta_lambda));
        var eta_prim = this.math_atanh(Math.cos(phi_star) * Math.sin(delta_lambda));
        var x = this.scale * a_roof * (xi_prim +
                        beta1 * Math.sin(2.0 * xi_prim) * this.math_cosh(2.0 * eta_prim) +
                        beta2 * Math.sin(4.0 * xi_prim) * this.math_cosh(4.0 * eta_prim) +
                        beta3 * Math.sin(6.0 * xi_prim) * this.math_cosh(6.0 * eta_prim) +
                        beta4 * Math.sin(8.0 * xi_prim) * this.math_cosh(8.0 * eta_prim)) +
                        this.false_northing;
        var y = this.scale * a_roof * (eta_prim +
                        beta1 * Math.cos(2.0 * xi_prim) * this.math_sinh(2.0 * eta_prim) +
                        beta2 * Math.cos(4.0 * xi_prim) * this.math_sinh(4.0 * eta_prim) +
                        beta3 * Math.cos(6.0 * xi_prim) * this.math_sinh(6.0 * eta_prim) +
                        beta4 * Math.cos(8.0 * xi_prim) * this.math_sinh(8.0 * eta_prim)) +
                        this.false_easting;
        x_y.push(Math.round(x * 1000.0) / 1000.0);
        x_y.push(Math.round(y * 1000.0) / 1000.0);

        return x_y;
    };

    // Conversion from grid coordinates to geodetic coordinates.
    this.grid_to_geodetic = function(x, y)
    {
        var lat_lon = []
        if (this.central_meridian == null)
        {
            return lat_lon;
        }
        // Prepare ellipsoid-based stuff.
        var e2 = this.flattening * (2.0 - this.flattening);
        var n = this.flattening / (2.0 - this.flattening);
        var a_roof = this.axis / (1.0 + n) * (1.0 + n * n / 4.0 + n * n * n * n / 64.0);
        var delta1 = n / 2.0 - 2.0 * n * n / 3.0 + 37.0 * n * n * n / 96.0 - n * n * n * n / 360.0;
        var delta2 = n * n / 48.0 + n * n * n / 15.0 - 437.0 * n * n * n * n / 1440.0;
        var delta3 = 17.0 * n * n * n / 480.0 - 37 * n * n * n * n / 840.0;
        var delta4 = 4397.0 * n * n * n * n / 161280.0;

        var Astar = e2 + e2 * e2 + e2 * e2 * e2 + e2 * e2 * e2 * e2;
        var Bstar = -(7.0 * e2 * e2 + 17.0 * e2 * e2 * e2 + 30.0 * e2 * e2 * e2 * e2) / 6.0;
        var Cstar = (224.0 * e2 * e2 * e2 + 889.0 * e2 * e2 * e2 * e2) / 120.0;
        var Dstar = -(4279.0 * e2 * e2 * e2 * e2) / 1260.0;

        // Convert.
        var deg_to_rad = Math.PI / 180;
        var lambda_zero = this.central_meridian * deg_to_rad;
        var xi = (x - this.false_northing) / (this.scale * a_roof);
        var eta = (y - this.false_easting) / (this.scale * a_roof);
        var xi_prim = xi -
                        delta1 * Math.sin(2.0 * xi) * this.math_cosh(2.0 * eta) -
                        delta2 * Math.sin(4.0 * xi) * this.math_cosh(4.0 * eta) -
                        delta3 * Math.sin(6.0 * xi) * this.math_cosh(6.0 * eta) -
                        delta4 * Math.sin(8.0 * xi) * this.math_cosh(8.0 * eta);
        var eta_prim = eta -
                        delta1 * Math.cos(2.0 * xi) * this.math_sinh(2.0 * eta) -
                        delta2 * Math.cos(4.0 * xi) * this.math_sinh(4.0 * eta) -
                        delta3 * Math.cos(6.0 * xi) * this.math_sinh(6.0 * eta) -
                        delta4 * Math.cos(8.0 * xi) * this.math_sinh(8.0 * eta);
        var phi_star = Math.asin(Math.sin(xi_prim) / this.math_cosh(eta_prim));
        var delta_lambda = Math.atan(this.math_sinh(eta_prim) / Math.cos(xi_prim));
        var lon_radian = lambda_zero + delta_lambda;
        var lat_radian = phi_star + Math.sin(phi_star) * Math.cos(phi_star) *
                        (Astar +
                         Bstar * Math.pow(Math.sin(phi_star), 2) +
                         Cstar * Math.pow(Math.sin(phi_star), 4) +
                         Dstar * Math.pow(Math.sin(phi_star), 6));
        lat_lon.push(lat_radian * 180.0 / Math.PI);
        lat_lon.push(lon_radian * 180.0 / Math.PI);
        return lat_lon;
    };


    this.math_sinh = function(value) {
        return 0.5 * (Math.exp(value) - Math.exp(-value));
    };
    this.math_cosh = function(value) {
        return 0.5 * (Math.exp(value) + Math.exp(-value));
    };
    this.math_atanh = function(value) {
        return 0.5 * Math.log((1.0 + value) / (1.0 - value));
    };
}



function Position(lat, lon, format){
    this.Grid =
    {
        'RT90' : 0,
        'WGS84' : 1,
        'SWEREF99' : 2
    }
    this.Latitude = lat;
    this.Longitude = lon;
    this.GridFormat = format;

    this.setLat = function(value){
        this.Latitude = value;
    };

    this.setLon = function(value){
        this.Longitude = value;
    };

    this.setFormat = function(value){
        this.GridFormat = value;
    };
}



function RT90Position(x, y, rt90projection)
{
    this.RT90Projection =
    {
        rt90_7_5_gon_v : 0,
        rt90_5_0_gon_v : 1,
        rt90_2_5_gon_v : 2,
        rt90_0_0_gon_v : 3,
        rt90_2_5_gon_o : 4,
        rt90_5_0_gon_o : 5
    }

    this.x = x;
    this.y = y;
    this.Projection = rt90projection;
    this.setProjection = function(value){
        this.Projection = value;
    };
    this.getProjection = function(){
        return this.Projection;
    };

    this.getProjectionString =  function(projection)
    {
        var retVal = "";
        switch (projection)
        {
            case this.RT90Projection.rt90_7_5_gon_v:
                retVal = "rt90_7.5_gon_v";
                break;
            case this.RT90Projection.rt90_5_0_gon_v:
                retVal = "rt90_5.0_gon_v";
                break;
            case this.RT90Projection.rt90_2_5_gon_v:
                retVal = "rt90_2.5_gon_v";
                break;
            case this.RT90Projection.rt90_0_0_gon_v:
                retVal = "rt90_0.0_gon_v";
                break;
            case this.RT90Projection.rt90_2_5_gon_o:
                retVal = "rt90_2.5_gon_o";
                break;
            case this.RT90Projection.rt90_5_0_gon_o:
                retVal = "rt90_5.0_gon_o";
                break;
            default:
                retVal = "rt90_2.5_gon_v";
                break;
        }

        return retVal;
    };

    this.toWGS84 = function(){
        var gkProjection = new GaussKreuger();
        gkProjection.swedish_params(this.getProjectionString(this.getProjection()));
        var lat_lon = gkProjection.grid_to_geodetic(this.x, this.y);
        return new WGS84Position(lat_lon[0],lat_lon[1]);
    };
}


function WGS84Position(latitude, longitude)
{
    this.Latitude = latitude;
    this.Longitude = longitude;
    
    this.WGS84Format = {
        Degrees : 0,
        DegreesMinutes : 1,
        DegreesMinutesSeconds : 2
    }
   
    this.LatitudeToString = function(wGS84Formatformat)
    {
        if (wGS84Formatformat == this.WGS84Format.DegreesMinutes)
            return this.ConvToDmString(this.Latitude, 'N', 'S');
        else if (wGS84Formatformat == this.WGS84Format.DegreesMinutesSeconds)
            return this.ConvToDmsString(this.Latitude, 'N', 'S');
        else
            return this.Latitude;
    }

    this.LongitudeToString = function(wGS84Formatformat)
    {
        if (wGS84Formatformat == 1)
            return ConvToDmString(this.Longitude, 'E', 'W');
        else if (wGS84Formatformat == 2)
            return ConvToDmsString(this.Longitude, 'E', 'W');
        else
            return this.Longitude;
    }

    this.ConvToDmString = function(value,positiveValue,negativeValue)
    {
        if (value == null)
        {
            return "";
        }

        var degrees = Math.floor(Math.abs(value));
        var minutes = (Math.abs(value) - degrees) * 60;
        return (value >= 0 ? positiveValue : negativeValue)+" "+degrees+"º "+(Math.Floor(minutes * 10000) / 10000);
    }

    this.ConvToDmsString = function(value, positiveValue, negativeValue)
    {
        if (value == null)
        {
            return "";
        }

        var degrees = Math.floor(Math.abs(value));
        var minutes = Math.floor((Math.abs(value) - degrees) * 60);
        var seconds = (Math.abs(value) - degrees - minutes / 60) * 3600;
        return (value >= 0 ? positiveValue : negativeValue)+" "+degrees+"º "+minutes+"' "+"Math.Round(seconds, 5)\"";
    }

    this.toSWEREF99TM = function(){
        var gkProjection = new GaussKreuger();
        gkProjection.swedish_params('sweref_99_tm');
        var lat_lon = gkProjection.geodetic_to_grid(this.Latitude, this.Longitude);
        return new SWEREF99Position(lat_lon[0],lat_lon[1]);
    };
}

//WGS84Position.inherits(Position);

function SWEREF99Position(n,e)
{
    this.SWEREFProjection =
    {
        sweref_99_tm : 0,
        sweref_99_12_00 : 1,
        sweref_99_13_30 : 2,
        sweref_99_15_00 : 3,
        sweref_99_16_30 : 4,
        sweref_99_18_00 : 5,
        sweref_99_14_15 : 6,
        sweref_99_15_45 : 7,
        sweref_99_17_15 : 8,
        sweref_99_18_45 : 9,
        sweref_99_20_15 : 10,
        sweref_99_21_45 : 11,
        sweref_99_23_15 : 12
    }

    this.n = n;
    this.e = e;
    this.Projection = this.SWEREFProjection.sweref_99_tm;

    /// <summary>
    /// Convert the position to WGS84 format
    /// </summary>
    /// <returns></returns>
    this.toWGS84 = function(){
        var gkProjection = new GaussKreuger();
        gkProjection.swedish_params(this.getProjectionString(this.getProjection()));
        var lat_lon = gkProjection.grid_to_geodetic(this.n, this.e);
        return new WGS84Position(lat_lon[0],lat_lon[1]);
    };

    this.getProjectionString = function(projection)
    {
        var retVal = "";
        switch (projection)
        {
            case this.SWEREFProjection.sweref_99_tm:
                retVal = "sweref_99_tm";
                break;
            case this.SWEREFProjection.sweref_99_12_00:
                retVal = "sweref_99_1200";
                break;
            case this.SWEREFProjection.sweref_99_13_30:
                retVal = "sweref_99_1330";
                break;
            case this.SWEREFProjection.sweref_99_14_15:
                retVal = "sweref_99_1415";
                break;
            case this.SWEREFProjection.sweref_99_15_00:
                retVal = "sweref_99_1500";
                break;
            case this.SWEREFProjection.sweref_99_15_45:
                retVal = "sweref_99_1545";
                break;
            case this.SWEREFProjection.sweref_99_16_30:
                retVal = "sweref_99_1630";
                break;
            case this.SWEREFProjection.sweref_99_17_15:
                retVal = "sweref_99_1715";
                break;
            case this.SWEREFProjection.sweref_99_18_00:
                retVal = "sweref_99_1800";
                break;
            case this.SWEREFProjection.sweref_99_18_45:
                retVal = "sweref_99_1845";
                break;
            case this.SWEREFProjection.sweref_99_20_15:
                retVal = "sweref_99_2015";
                break;
            case this.SWEREFProjection.sweref_99_21_45:
                retVal = "sweref_99_2145";
                break;
            case this.SWEREFProjection.sweref_99_23_15:
                retVal = "sweref_99_2315";
                break;
            default:
                this.retVal = "sweref_99_tm";
                break;
        }

        return retVal;
    }

    this.setProjection = function(value){
        this.Projection = value;
    };
    this.getProjection = function(){
        return this.Projection;
    };
}
