const Applet = imports.ui.applet;
const Soup = imports.gi.Soup;
const Lang = imports.lang;
const Mainloop = imports.mainloop; // Importe o módulo Mainloop

function MyApplet(orientation, panel_height, instance_id) {
    this._init(orientation, panel_height, instance_id);
}

MyApplet.prototype = {
    __proto__: Applet.TextApplet.prototype,

    _init: function(orientation, panel_height, instance_id) {
        Applet.TextApplet.prototype._init.call(this, orientation, panel_height, instance_id);
        
        this._soupSession = new Soup.SessionAsync();
        this._number = 0;

        this._updateNumber(); // Initial update

        // Schedule subsequent updates every 5 minutes
        this._updateInterval = Mainloop.timeout_add_seconds(60, Lang.bind(this, function() {
            this._updateNumber();
            return true; // Return true to keep the timeout running
        }));

    },

    _updateNumber: function() {
        let url = "https://webservice.windel.com.br/clientesWindelWeb";
        let message = Soup.Message.new("GET", url);
        
        this._soupSession.queue_message(message, Lang.bind(this, function(session, message) {
            if (message.status_code === 200) {
                let response = message.response_body.data.trim(); // Trim to remove leading/trailing spaces
                let number = parseFloat(response); // Parse the number
                if (!isNaN(number)) {
                    this._number = number;
                    this.set_applet_label(this._number.toString());
                } else {
                    global.log("Invalid number received from web route"); // Change 'log' to 'global.log'
                }
            } else {
                global.log("Failed to fetch number from web route"); // Change 'log' to 'global.log'
            }
        }));
    },

    on_applet_clicked: function() {
        this._updateNumber();
    }
};

function main(metadata, orientation, panel_height, instance_id) {
    return new MyApplet(orientation, panel_height, instance_id);
}
