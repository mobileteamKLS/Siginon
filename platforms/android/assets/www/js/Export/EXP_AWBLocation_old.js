﻿
var CargoWorksServiceURL = window.localStorage.getItem("CargoWorksServiceURL");
var AirportCity = window.localStorage.getItem("SHED_AIRPORT_CITY");
var UserId = window.localStorage.getItem("UserID");
var CompanyCode = window.localStorage.getItem("companyCode");
var SHEDCODE = window.localStorage.getItem("SHED_CODE");
var flightSeqNo;
var ULDSeqNo;

$(function () {

    var language = window.localStorage.getItem("Language");

    switch (language) {
        case "English":
            //setEnglish();
            break;
        case "German":
            setGerman();
            break;
        case "Russian":
            setRussian();
            break;
        case "Turkish":
            setTurkish();
            break;
    }

});

function setEnglish() {
    $('#lblUnitization').text("Unitization");

}

function setGerman() {
    $('#lblAWBno').text("AWB Nr.");
    $('#lblAcceptance').text("Annahme");
    $('#lblShipmentNo').text("Sendungs Nr.");
    $('#lblPackages').text("Stückzahl");
    $('#lblGrWt').text("Brutto Gewicht");
    $('#lblLocation').text("Stellplatz");
    $('#lblChangeLoc').text("Veränderung Stellp.");
    $('#lblLocate').text("Lokalisieren");
    $('#btnModify').val("Senden");
}

function setRussian() {
    $('#lblAWBno').text("номер авианакладной");
    $('#lblAcceptance').text("приём");
    $('#lblShipmentNo').text("номер партии");
    $('#lblPackages').text("количество");
    $('#lblGrWt').text("вес брутто");
    $('#lblLocation').text("добавить место");
    $('#lblChangeLoc').text("изменение место");
    $('#lblLocate').text("разместить");
    $('#btnModify').val("отправить");
}

function setTurkish() {
    $('#lblAWBno').text("AWB No.");
    $('#lblAcceptance').text("kabul");
    $('#lblShipmentNo').text("gösteri Nr.");
    $('#lblPackages').text("Paket Sayisi");
    $('#lblGrWt').text("brüt ağırlık");
    $('#lblLocation').text("yer");
    $('#lblChangeLoc').text("yer değiştir");
    $('#lblLocate').text("yerleştirmek");
    $('#btnModify').val("göndermek");
    $('#btnExcLanded').val("çikiş");
}


function GetShipmentDetails(AWBid) {

    var inputxml = "";

    var connectionStatus = navigator.onLine ? 'online' : 'offline'

    var errmsg = "";

    //inputxml = '<Root><FlightSeqNo>' + flightSeqNo + '</FlightSeqNo><UlDSeqNo></UlDSeqNo><AirportCity>' + AirportCity + '</AirportCity></Root>';

    $('#ddlULDNo').empty();

    if (errmsg == "" && connectionStatus == "online") {
        $.ajax({
            type: "POST",
            url: CargoWorksServiceURL + "GetVCTULDAWBDetail",
            data: JSON.stringify({
                'strAWBNo': AWBid, 'CompanyCode': CompanyCode, 'strAirportCity': AirportCity, 'strCycle': 'E',
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (Result) {
                Result = Result.d;
                var xmlDoc = $.parseXML(Result);

                $(xmlDoc).find('Table').each(function (index) {

                    Packages = $(this).find('NOP').text();
                    GrossWt = $(this).find('WEIGHT_KG').text();

                    $('#txtPackages').val('Packages');
                    $('#txtGrossWt').val('GrossWt');

                    var ShpmentId;
                    var ShpmentNo;
                    ShpmentId = $(this).find('SHIPMENT_NUMBER').text();
                    ShpmentNo = $(this).find('SHIPMENT_NUMBER').text();

                    var newOption = $('<option></option>');
                    newOption.val(ShpmentId).text(ShpmentNo);
                    newOption.appendTo('#ddlShipmentNo');

                });
            },
            error: function (msg) {
                $("body").mLoading('hide');
                $.alert('Data could not be loaded');
            }
        });
        return false;
    }
    else if (connectionStatus == "offline") {
        $("body").mLoading('hide');
        $.alert('No Internet Connection!');
    }
    else if (errmsg != "") {
        $("body").mLoading('hide');
        $.alert(errmsg);
    }
    else {
        $("body").mLoading('hide');
    }


}


function SaveDetails() {

    var connectionStatus = navigator.onLine ? 'online' : 'offline'
    var errmsg = "";

    //var strAWBNo = $('#ddlAWBNo').find('option:selected').text();
    var strAWBNo = $('#txtAWBNo').val();
    var strPkgs = $('#txtPackages').val();
    var strGrossWt = $('#txtGrossWt').val();
    var strLocationCode = $('#txtLocation').val();
    var strShipmentNo = "";

    if ($('#ddlShipmentNo').find('option:selected').text() == "Select") {
        strShipmentNo = "0";
    }
    else {
        strShipmentNo = $('#ddlShipmentNo').find('option:selected').text();
    }

    var strWtUnit = 'KG';

    var receive = '1';

    if (document.getElementById('chkReceive').checked) {
        receive = 'true';
    } else {
        receive = 'false';
    }


    if (strAWBNo == "" || strPkgs == "" || strGrossWt == "" || strLocationCode == "") {

        errmsg = "Please enter all the required fields.</br>";
        $.alert(errmsg);
        return;
    }

    if (strAWBNo.length != '11') {
        errmsg = "Please enter valid AWB No.";
        $.alert(errmsg);
        return;
    }

    if (errmsg == "" && connectionStatus == "online") {
        $.ajax({
            type: "POST",
            url: CargoWorksServiceURL + "EXPSaveLocation",
            data: JSON.stringify({
                'strAWBNo': strAWBNo, 'strAirportCity': AirportCity, 'CompanyCode': CompanyCode,
                'strPkgs': strPkgs, 'strGrossWt': strGrossWt, 'strLocationCode': strLocationCode,
                'strShipmentNo': strShipmentNo, 'strUserID': UserId, 'strLifeCycleStatus': 'E',
                'strWtUnit': strWtUnit, 'blnLocChange': receive, 'intRecLoc': 1,
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            beforeSend: function doStuff() {
                //$('.dialog-background').css('display', 'block');
                $('body').mLoading({
                    text: "Please Wait..",
                });
            },
            success: function (response) {
                $("body").mLoading('hide');
                $.alert('Details saved successfully');
                //window.location.reload();
            },
            error: function (msg) {
                $("body").mLoading('hide');
                $.alert('Some error occurred while saving data');
            }
        });
        return false;
    }

}



function clearALL() {
    $('#txtIGMNo').val('');
    $('#txtIGMYear').val('');
    $('#txtFlightPrefix').val('');
    $('#txtFlightNo').val('');
    $('#txtFlightDate').val('');
    $('#txtTotCnts').val('');
    $('#txtManiPieces').val('');
    $('#txtReceivePieces').val('');
    $('#txtManiGrWt').val('');
    $('#txtReceiveGrWt').val('');
    $('#txtShortPieces').val('');
    $('#txtExcessPieces').val('');
    $('#txtDamagePieces').val('');
}

function ClearError(ID) {
    $("#" + ID).css("background-color", "#e7ffb5");
}
function ClearFields() {
    $('.ClearFields input[type=text]').val("");
}


