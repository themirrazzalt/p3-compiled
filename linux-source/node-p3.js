const { io } = require("socket.io-client");




class P3 {
    /**
     * Your P3 secret set when creating the interface.
     * @type {string}
     *
     *
     */
    key
    /**
     * Your P3 address, provided by the network.
     * @type string
     */
     adr
     /**
      * Wether the interface is connected to the P3 network.
      * @type boolean
      */
     active
  /**
   * Constructs a P3 interface object.
   * @param options{{autoinit:boolean,secret:string,url:string}|string} - The P3 config options. Strings will be treated as your secret.
   */
  constructor(options) {
    options=options||""
      if(typeof options=='string'||options instanceof String) {
          var url=""
          var secret=options
      } else {
          var {secret,url}=options
          if(options.autoinit) {
              setTimeout(()=>this.start(),3)
          }
      }
    url=String(url||"wss://p3.windows96.net/")||"wss://p3.windows96.net/"

var $CONNECTED=false;
var $CONNECTING=false;

var $totalMsg=0;
var letters = "abcdefghijklmnopqrstuvwxyz+1234567890/ABCDEFGH,:#\\?@-_]{}~";
var total_nonce = 0;
function Nonce() {
  return total_nonce++;
}


function waitUntil(bool) {
  return new Promise(function (g) {
    var X$=setInterval(function () {
      if(bool()){
        clearInterval(X$);
        g();
      }
    })
  })
}



var key=secret||generateSecretKey();

this.portInUse = function (port) {
  if(ports[port]) {
    return true;
  }
  return false;
}

this.getPortsInUse = function () {
  return Object.keys(ports).concat([119]);
}

function $ResponsePort() {
  var p$=[];
  for(var i = 0; i < 70001;i++) {
    if(!ports[i]) {
      p$.push(i)
    }
  }
  return p$[
    Math.floor(
      Math.random()*p$.length
    )
  ]
};








function generatePeerID() {
  var $r='';
  for(var i = 0; i < 40;i++) {
    $r+=letters[Math.floor(
      Math.random()*letters.length
    )]
  }
  return btoa($r)
}

function generateSecretKey() {
  var $r='';
  for(var i = 0; i < 10;i++) {
    $r+=letters[Math.floor(
      Math.random()*letters.length
    )]
  }
  return btoa($r)
}

var skt=io(url,{
  autoConnect: false
});
skt.on("connect", function (E) {
  setTimeout(function () {
  skt.emit("hello", key)
  }, 100)
});

var home = this;


function setskey(sky){
  key=sky;
}
/**
 * Constructs client to connect to a P3 Server.
 * @param {string} adr - The P3 address to connect to.
 * @param {string|number} prt - The port to connect to.
 */
function P3Client(adr,prt) {
    /**@private*/
  var $NONCE = this.$NONCE = {
    count: 0
  };
  /**@private*/
  var $E=this.$EVT={
    "connect":[],
    "message":[],
    'disconnect':[],
    'fail': []
  };
  /**@private*/
  var $H=this.$HBData={
    intervalId:0,
    beat:15000
  }
  var that=this
  /**
   * Information about the server you are connecting to.
   */
  var $S=this.server = {
      /**
       * The address of the server you are connecting to.
       */
    address:adr,
    /**
     * The port of the server you are connecting to.
     */
    port:prt,
    /**
     * The address and port of the server, combined by a colon.
     */
    destination:adr+":"+prt,
    /**
     * The internal peer ID of your client.
     * @type {string|null}
     */
    id: null,
  };
  var rpt=$ResponsePort();
  /**@private*/
  this.$CLIENT = {
    responsePort:rpt
  }
  skt.on('packet', function (a$) {
     if(a$.source==$S.address&&a$.port==rpt&&a$.data.type=='message') {
      for(var i = 0; i < $E.message.length;i++) {
        try {
          $E.message[i](a$.data.data)
        } catch (E){
          null
        }
      }
    } else if(a$.source==$S.address&&a$.port==rpt&&a$.data.type=='disconnect') {
      for(var i = 0; i < $E.message.length;i++) {
        try {
          $E.disconnect[i]()
        } catch (E){
          null
        }
      }
       $CONNECTED=false
       that.ended=true
       home.endPort(that.$CLIENT.responsePort);
    }
  });
  var $$ACK=false
  var hb$ = function (a$) {
    if($$ACK){return}
    $$ACK=true
    for(var i = 0; i < $E.connect.length;i++) {
      try {
        $E.connect[i]()
      } catch (E) {
        null
      }
    }
    $S.id=a$.data.peerID;
    $H.beat=a$.data.heartbeat;
    $H.intervalId=setInterval(function () {
      skt.emit('packet', {
        dest: adr+":"+prt,
        data: {
          type: 'heartbeat',
          peerID: $S.id
        },
        nonce:Nonce()
      });
    }, a$.data.heartbeat)
  }
  var _PkE = function (dat) {
    if(dat.nonce != _nonce) { return false; }
    for(var i = 0; i < $E.connect.length;i++) {
      try {
        $E.fail[i](dat)
      } catch (E) {
        null
      }
    }
    skt.off('packet.err',_PkE);
  }
  var $$WAITFORACCEPT = function (a$) {
    if(a$.data.type==='ack'&&a$.port==rpt) {
      hb$(a$);
      skt.off('packet.err',_PkE)
    }
  }
  skt.on('packet.err',_PkE);
  this.ended=false;
  var _nonce = Nonce();
  setTimeout(async function () {
    await waitUntil(function(){return $CONNECTED})
    skt.emit('packet', {
      data: {
        type: 'connect',
        peerID: null,
        responsePort: rpt,
        nonce: 0
      },
      nonce:_nonce,
      dest: adr+":"+prt,
    });
    $NONCE.count=$NONCE.count+1;
  },500)
  skt.on("packet", $$WAITFORACCEPT)
}
/**
 * Listens for events.
 * @param {string} event The name of the event.
 * @param {(...args:any[])=>any} handler The function to call when the event is triggered.
 */
P3Client.prototype.on = function(event,handler) {
  if(!handler instanceof Function) {
    throw new TypeError("listener must be a function")
  }
  if(!this.$EVT[event]){return}
  this.$EVT[event].push(handler)
}

/**
 * Ends the connection with the server.
 */
P3Client.prototype.end = function () {
  clearInterval(this.$HBData.intervalId);
  skt.emit("packet", {
    dest:this.server.destination,
    data:{
      type:'disconnect',
      peerID:this.server.id
    },
    nonce:Nonce(),
  });
  /**
   * Wether the server has killed the connection with the client.
   */
  this.ended=true;
  home.endPort(this.$CLIENT.responsePort);
}

/**
 * Sends data to the server.
 * @param {*} data The data to send to the server.
 */
P3Client.prototype.emit = function (data) {
  if(this.ended) {
    throw new ReferenceError(
      "cannot emit on closed connection"
    )
  }
  skt.emit('packet', {
    dest:this.server.destination,
    data: {
      type:'message',
      peerID:this.server.id,
      data:data,
      nonce:this.$NONCE.count
    },
    nonce:Nonce()
  });
  this.$NONCE.count=this.$NONCE.count+1;
}


function runLatencyTest(peer) {
  return new Promise(resolve => {
    var nonce = Nonce();
    var msNow;
    var nonceNow;
    var okNow;
    var nonce_handler = function (data) {
      if(data.nonce != nonce) { return }
      nonceNow = Date.now();
      skt.off('packet.ok',nonce_handler)
    };
    var ok_handler = function (data) {
      if(data.data != 'p3_latency_test ok'
         && data.source != peer
         && data.port != 119
      ) { return }
      okNow = Date.now();
      resolve({
        clientToServer: nonceNow-msNow,
        clientToTarget: okNow-msNow
      });
      skt.off('packet',ok_handler);
    };
    skt.on('packet.ok',nonce_handler);
    skt.on('packet',ok_handler);
    msNow = Date.now();
    skt.emit(
      'packet',
      {
        nonce: nonce,
        dest: `${peer}:119`,
        data: 'p3_latency_test'
      }
    );
  });
}

this.runLatencyTest = runLatencyTest;





skt.on("packet", function(args) {
  if(args.port == 119) {
    if(args.data == 'p3_latency_test') {
      skt.emit(
        'packet',
        {
          nonce: Nonce(),
          dest: `${args.source}:119`,
          data: 'p3_latency_test ok'
        }
      );
      return null;
    } else if(args.data == 'p3_latency_test ok') {
      return null;
    }
  }
  if(args.data.type=="connect") {
    if(ports[args.port]) {
      var peerid=generatePeerID();
      skt.emit('packet', {
        data:{
          type:'ack',
        message: "Connection accepted",
          peerID:peerid,
        success:true,
        heartbeat:15000,
          code:100,
          nonce:0
        },
        dest:args.source+":"+args.data.responsePort,
        nonce:Nonce()
      });
      var t$EVT = {
        message:[]
      }
      var $NONCE={count:1}
      ports[args.port].evt({
        toString:function(){return "[object P3Event]"},
        peerId:peerid,
        peer: {
          adr: args.source,
          port: args.data.responsePort,
          emit: function (data) {
            skt.emit('packet', {
          data:{
            type:'message',
            data:data,
            peerID:null,
          success:true,
            nonce:$NONCE.count
          },
          dest:args.source+":"+args.data.responsePort,
          nonce:Nonce()
        });
            $NONCE.count = $NONCE.count+1;
          },
          disconnect: function () {
            skt.emit('packet', {
          data:{
            type:'disconnect',
            peerID:null,
          success:true,
            nonce:$NONCE.count
          },
          dest:args.source+":"+args.data.responsePort,
          nonce:Nonce()
        });
            $NONCE.count = $NONCE.count+1;
          }
        },
        nonceCount: {n$:$NONCE},
        on: CreateMessageListener(
          $NONCE,
          peerid,
          args.source,
          args.data.responsePort,
          args.port,
          t$EVT
        ),
        emit: function (data) {
          skt.emit('packet', {
        data:{
          type:'message',
          data:data,
          peerID:null,
        success:true,
          nonce:$NONCE.count
        },
        dest:args.source+":"+args.data.responsePort,
        nonce:Nonce()
      });
          $NONCE.count = $NONCE.count+1;
        }
      })
    }
  }
})


function CreateMessageListener(n$,i$,a$,p$,h$) {
  return function (e$,f$) {
    if(e$==='message') {
    skt.on('packet', function(evt){
      if(evt.port===h$&&evt.source===a$&&evt.data.type==='message'&&evt.data.peerID==i$) {
        f$(evt.data.data)
      }
    })
    } else if(e$==="disconnect") {
      skt.on('packet', function(evt){
      if(evt.port===h$&&evt.source===a$&&evt.data.type==='disconnect'&&evt.data.peerID==i$) {
        f$()
      }
    })
    }
  }
}


var L$ = {
  'fail':[],
  'connect':[],
  'state-change': []
};






var ports = {};

function addPort(portNumber,listenerFunction) {
  if(!listenerFunction instanceof Function) {
    throw new TypeError("listener must be a function");
  }
  if(ports[portNumber]) {
    throw new ReferenceError("port is already being used")
  }
  if(isNaN(portNumber)) {
    throw new TypeError("port must be an event name or number");
  }
  ports[portNumber]={
    evt:listenerFunction
  }
}

/**
 * Listens for instance-wide P3 events.
 * @param {string} event The name of the event.
 * @param {(...args:any[])=>any} handler The function to call when the event is triggered.
 */

this.on=function(event,handler) {
    if(!handler instanceof Function) {
        throw new TypeError("listener must be a function");
      }
      if(L$[event]) {
        L$[event].push(handler);
        return;
      }
}

    function removePort(portNumber) {
      ports[portNumber]=undefined
      delete ports[portNumber]
    }

var $EVT = {
  dispatch: function (name,evt) {
    if(!L$[name]) {
      return;
    }
    var gL=L$[name]
    for(var i=0;i<gL.length;i++){
      gL[i](evt)
    }
  }
}
    this.endPort=removePort


var $ADR="";

skt.on("hello", function(e){
    //console.log(e)
    if(!e.success && e.message==="PPP Server Error: Address already in use") {
      $EVT.dispatch(
        'fail',
        {
          reason: "Address is in use",
          code: "ADDRESS_IN_USE"
        }
      );
      $CONNECTING = false;
      $EVT.dispatch(
        'state-change',
        {
          address: home.adr,
          state: 'offline'
        }
      );
    } else if(!e.success) {return } else {
      $CONNECTED=true
      $ADR=e.address
      $EVT.dispatch(
        'connect',
        {
          address:$ADR
        }
      );
      $EVT.dispatch(
        'state-change',
        {
          address: e.address,
          state: 'online'
        }
      );
    }
})
    /**
     * Listens for a connection on a specific port.
     * @param {string|mumber} port - The port to listen on
     * @param {(client:P3Event)=>any} listener - The callback when the port is connected to
     */
    this.listen=function(port,listener){return addPort(port,listener)}
    Object.defineProperty(this,'adr',{
      get:function() {
        return $ADR
      }
    })
    Object.defineProperty(this,'active',{
      get:function() {
        return skt.connected
      }
    })
    Object.defineProperty(this,'key',{
      get:function() {
        return key
      },
      set:function(secret) {
        key=secret
      }
    })
    /**
     * Creates a client to connect to a P3 server.
     * @param {string} address
     * @param {string|number} port
     */
    this.createClient=function(address,port) {
      return new P3Client(address,port)
    }

    class P3Event {
        /**
         * The internal peer ID.
         * @type {string}
         */
        peerID
        /**
         * Represents the connected client.
         * @type {P3ClientPeer}
         */
        peer
        /**
         * Sends data to the connected peer.
         * @param {any} data The data to send.
         */
        emit(data) {}
        /**
         * Listens for events.autoinit
         * @param {string} event The name of the event to listen for.
         * @param {(...args:any[])=>any} handler The function to call when the event is triggered.
         */
        on(event,handler) {}
    }

    class P3ClientPeer {
        /**
         * The peer's P3 address.
         * @type {string}
         */
        adr
        /**
         * The response port of the peer.
         * @type {string}
         */
        port
        /**
         * Sends data to the connected peer.
         * @param {any} data The data to send.
         * @deprecated Use P3Event.emit instead of P3Event.peer.emit.
         */
        emit(data){}
    }


    /**
     * Force exits the network and terminates all active P3 connections.
     */
    this.kill=function(){
      skt.close()
      $CONNECTED = false;
      $CONNECTING = false;
      $EVT.dispatch('state-change',{
        state: 'offline',
        address: this.adr
      });
    }
    /**
     * Starts the P3 session if it has been killed.
     */
    this.start=function(){
      skt.open()
      $CONNECTING = true;
      $EVT.dispatch('state-change',{
        state: 'connecting',
        address: this.adr
      });
    }
    this.getState = function () {
      if($CONNECTED) {
        return 'online'
      } else if($CONNECTING) {
        return 'connecting'
      } else {
        return 'offline'
      }
    }
  }

}

module.exports = P3
