$(document).ready(function($){

    $('#brutto, #geburtsjahr').on('focus', function(e){

        $(this).val('');

    });

    $('#optionalefelderbtn').on('click', function(){
        //$('#optional_fields').slideToggle();

        if ($('#optional_fields').is(':visible')) {
            $('#optional_fields').slideUp();
            $('#optionalefelderbtn').val('oder detailiert berechnen');
        }else{
            $('#optional_fields').slideDown();
            $('#optionalefelderbtn').val('oder einfach berechnen');
        }

    });

    

    var bnr_result = document.getElementById('bnr_result');

    if(bnr_result){
        bnr_result.addEventListener("load", initialise_bnr());
    }

    bnr_set_active_label('.ivb_tool_bnr_kirche input');

    $('#tecis').on('shown.bs.modal', function () {
      $('#firstname').focus();
      ga('send', 'event', 'tecis', 'openModal', 'Persönliches Angebot');
    })

    $(document).on('change', 'input:radio[name^="kv"]', function () {
        bnr_toggle_krankenkasse();
    });

    $(document).on('change', 'input:radio[name^="lohnart"]', function () {
        bnr_toggle_lohnart();
    });

    $(document).on('change', '#krankenversicherung', function () {
        bnr_toggle_kvzusatzbeitrag();
    });

    $(document).on('change', 'input:radio[name^="kinder"]', function () {
        bnr_toggle_kinderfreibetrag();
    });

    $(document).on('focus', '#gwv', function() {
       $('#gwvrechner').modal('show');        
    });

    $('.owngwv').on('click', function(e){
        //changeFormGwv(e);
        $('#gwvcalc .selfgwv').show();
        $('#gwvcalc .del').hide();
    });

    $('.calcgwv').on('click', function(e) {
       //e.preventDefault();
       //$('#gwvcalc .selfgwv').addClass('hide');
       //$('#gwvcalc .del').removeClass('hide');
       $('#gwvcalc .selfgwv').hide();
       $('#gwvcalc .del').show();
    });

    $('.calcgwvnow').on('click', function(e) {
        //changeFormGwv(e);
        var gwvval = parseFloat( $('#blp').val() ) * ( parseFloat( $('#km').val() ) * 0.03 + 1 ) / 100;
        //$('#gwpmopdal').autoNumeric('set', gwvval);
        anElement = new AutoNumeric('#gwpmopdal');
        anElement.set(gwvval);

        $('#gwvcalc .selfgwv').show();
        $('#gwvcalc .del').hide();
    });

    $('.takegwv').on('click', function(e) {
        //$('#gwv').autoNumeric('set', $('#gwpmopdal').autoNumeric('get') );
        anElement2 = new AutoNumeric('#gwv');
        anElement3 = new AutoNumeric('#gwpmopdal');
        anElement2.set(anElement3.getNumericString());

        $('#gwvrechner').modal('hide');
    });

});

/*function changeFormGwv(e) {
   e.preventDefault();
   $('#gwvcalc .selfgwv').removeClass('hide');
   $('#gwvcalc .del').addClass('hide');
}*/

function bnr_toggle_krankenkasse()
{
    if(jQuery("input[type=radio][name ='kv']:checked").val() == 0)
    {
        $('#ivb_tool_bnr_pkv').show(200);
        $('.ivb_tool_bnr_agz').show(200);
        $('#ivb_tool_bnr_gkv').hide(200);
        $('#ivb_tool_bnr_kvzusatzbeitrag').hide(200);
    }
    else
    {
        $('#ivb_tool_bnr_gkv').show(200);
        $('#ivb_tool_bnr_pkv').hide(200);
        $('.ivb_tool_bnr_agz').hide(200);

        bnr_toggle_kvzusatzbeitrag();
    }
}

function bnr_toggle_lohnart()
{
    if(jQuery("input[type=radio][name ='lohnart']:checked").val() == 0)
    {
        $('#ivb_stundenlohn').show(200);
        $('#ivb_arbeitsstunden').show(200);
        $('#ivb_brutto').hide(200);
    }
    else
    {
        $('#ivb_stundenlohn').hide(200);
        $('#ivb_arbeitsstunden').hide(200);
        $('#ivb_brutto').show(200);
    }
}

function bnr_onchange_stdlohn() {
    var b = parseFloat( parseFloat( $('#stdlohn').autoNumeric('get') ) * parseFloat( $('#arbeitstd').autoNumeric('get') ) * 13 / 3 );
    $('#brutto').autoNumeric('set', b);
}


function bnr_toggle_kvzusatzbeitrag()
{
    if(jQuery('#krankenversicherung').val() == 0)
    {
        $('#ivb_tool_bnr_kvzusatzbeitrag').show(200);
    }
    else
    {
        $('#ivb_tool_bnr_kvzusatzbeitrag').hide(200);
    }
}

function bnr_toggle_kinderfreibetrag()
{
    if(jQuery("input[type=radio][name ='kinder']:checked").val() == 1)
    {
        $('#ivb_tool_bnr_kinderfreibetrag').show(200);
    }
    else
    {
        $('#ivb_tool_bnr_kinderfreibetrag').hide(200);
    }
}

function bnr_toggle_faktor($this)
{   
    if(jQuery("div.ivb_tool_bnr_sk select").val() == 4)
    {
        $('.ivb_tool_bnr_faktor').show(200);
    }
    else
    {
        $('.ivb_tool_bnr_faktor').hide(200);
    }
}

function bnr_check_values(ajax) {
    var error = false;
    var error_message = '';
    var error_messages  = [];
    var error_elements  = [];

    var brutto = jQuery('#brutto');
    if( jQuery('#arbeitstd').length > 0 ) {
        var stdlohn = jQuery('#stdlohn');
        var astd = jQuery('#arbeitstd');
    }
    var jahrgang = jQuery('#jahrgang');
    var sfb = jQuery('#sfb');
    var bav = jQuery('#bav');
    var gwv = jQuery('#gwv');
    var faktor = jQuery('#faktor');
    var plz = jQuery('#plzhidden').val();
    var ort = jQuery('#orthidden').val();

    var kinder = jQuery("input[type=radio][name ='kinder']:checked").val();
    var kinderfreibetrag = jQuery('#kinderfreibetrag').val();

    if(parseFloat(brutto.autoNumeric('get')) > brutto.attr('max') || parseFloat(brutto.autoNumeric('get')) < brutto.attr('min') || brutto.val().length == 0 )
    {
        error_message = 'Bitte geben Sie ein Gehalt zwischen ' + brutto.attr('min') + ' und ' + brutto.attr('max') + ' an!';
        brutto.attr('title', error_message);
        error_messages.push(error_message);
        error_elements.push('#brutto');
        error = true;
    }

    if(stdlohn) {
        if( (parseFloat(stdlohn.autoNumeric('get')) > stdlohn.attr('max') || parseFloat(stdlohn.autoNumeric('get')) < stdlohn.attr('min') || stdlohn.val().length == 0 ) && $("input[name ='lohnart']:checked").val() == 0 )
        {
            error_message = 'Bitte geben Sie einen Stundenlohn zwischen ' + stdlohn.attr('min') + ' und ' + stdlohn.attr('max') + ' an!';
            stdlohn.attr('title', error_message);
            error_messages.push(error_message);
            error_elements.push('#stdlohn');
            error = true;
        }
    }

    if( astd ) {
        if( (parseFloat(astd.autoNumeric('get')) > astd.attr('max') || parseFloat(astd.autoNumeric('get')) < astd.attr('min') || astd.val().length == 0 ) && $("input[name ='lohnart']:checked").val() == 0 )
        {
            error_message = 'Bitte geben Sie Arbeitsstunden pro Woche zwischen ' + astd.attr('min') + ' und ' + astd.attr('max') + ' an!';
            astd.attr('title', error_message);
            error_messages.push(error_message);
            error_elements.push('#arbeitstd');
            error = true;
        }
    }

    if(parseInt(jahrgang.val()) > jahrgang.attr('max') || parseInt(jahrgang.val()) < jahrgang.attr('min') || jahrgang.val().length == 0)
    {
        error_message = 'Bitte geben Sie ein Geburtsjahr zwischen ' + jahrgang.attr('min') + ' und ' + jahrgang.attr('max') + ' an!';
        jahrgang.attr('title', error_message);
        error_messages.push(error_message);
        error_elements.push('#jahrgang');
        error = true;
    }

    if(parseFloat(faktor.val()) > faktor.attr('max') || parseFloat(faktor.val()) < faktor.attr('min'))
    {
        error_message = 'Bitte geben Sie einen Faktor zwischen ' + faktor.attr('min') + ' und ' + faktor.attr('max') + ' an!';
        faktor.attr('title', error_message);
        error_messages.push(error_message);
        error_elements.push('#faktor');
        error = true;
    }

    if(parseFloat(bav.autoNumeric('get')) > bav.attr('max') || parseFloat(bav.autoNumeric('get')) < bav.attr('min'))
    {
        error_message = 'Bitte geben Sie für die betriebliche Altersvorsorge einen Wert zwischen ' + bav.attr('min') + ' und ' + bav.attr('max') + ' an!';
        bav.attr('title', error_message);
        error_messages.push(error_message);
        error_elements.push('#bav');
        error = true;
    }

    if(parseFloat(sfb.autoNumeric('get')) > sfb.attr('max') || parseFloat(sfb.autoNumeric('get')) < sfb.attr('min'))
    {
        error_message = 'Bitte geben Sie einen Steuerfreibetrag zwischen ' + sfb.attr('min') + ' und ' + sfb.attr('max') + ' an!';
        sfb.attr('title', error_message);
        error_messages.push(error_message);
        error_elements.push('#sfb');
        error = true;
    }

    if(parseFloat(gwv.autoNumeric('get')) < gwv.attr('min'))
    {
        error_message = 'Bitte geben Sie einen Geldwertvorteil von ' + sfb.attr('min') + ' oder höher an!';
        gwv.attr('title', error_message);
        error_messages.push(error_message);
        error_elements.push('#gwv');
        error = true;
    }

    if(kinder == 1 && kinderfreibetrag == 0)
    {
        error_message = 'Bitte geben Sie einen Kinderfreibetrag an, wenn Sie ein Kind haben!';
        jQuery('#kindernein').attr('title', error_message);
        error_messages.push(error_message);
        error_elements.push('#kindernein');
        error = true;
    }

    if(plz.length == 0 || ort.length == 0) {
        error_message = 'Bitte geben Sie Ihre PLZ ein und wählen einen Eintrag aus der Liste.';
        jQuery('#plz').attr('title', error_message);
        error_messages.push(error_message);
        error_elements.push('#plz');
        error = true;
    }

    if(error == false) {
        if( ajax == false ) {
            $('.ivb_tool_bnr_form').submit();
        } else {
            jQuery('#bnr_loading_container').addClass('loading');
            if( $('.btn-taxtrixa').length > 0 ) {
                bnr_calculate_result_tt();
            } else {
                bnr_calculate_result(true);
            }
            jQuery('#bnr_gehaltscheck_container').show(200);
            jQuery('#check_brutto').val(jQuery('#brutto').autoNumeric('get'));
            jQuery('#check_job').val(jQuery('#beruf').val());
        }
    }
    else {
        bnr_display_tooltips(error_elements);
    }
}

function bnr_set_active_label(field) {

    $(field).each( function() {
        if( this.checked ) {
            $(this).parent('label').addClass('active');
            if( $(this).val() == '4' ) {
                bnr_toggle_faktor();
            }
        }
    });
}