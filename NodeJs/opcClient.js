const opcua = require("node-opcua-client");

const endpointUrl = "opc.tcp://SEU_OPC_UA_SERVER:4840";

async function connectAndMonitor() {
  try {
    const client = opcua.OPCUAClient.create({
      endpointMustExist: false,
    });

    await client.connect(endpointUrl);
    console.log("Conectado ao servidor OPC-UA");

    const session = await client.createSession();
    console.log("Sessão criada");

    // Monitore os bits que você quer
    const itemsToMonitor = [
      { nodeId: "ns=1;s=Retroaviso", displayName: "Retroaviso" },
      { nodeId: "ns=1;s=Alarme01", displayName: "Alarme 01" },
      { nodeId: "ns=1;s=Alarme02", displayName: "Alarme 02" }
    ];

    for (const item of itemsToMonitor) {
      const monitoredItem = await session.monitor(
        { nodeId: item.nodeId, attributeId: opcua.AttributeIds.Value },
        { samplingInterval: 1000, discardOldest: true, queueSize: 10 },
        opcua.TimestampsToReturn.Both
      );

      monitoredItem.on("changed", (dataValue) => {
        console.log(`Valor do ${item.displayName}:`, dataValue.value.value);
        // Aqui você pode mandar esse valor pra interface React Native via postMessage
      });
    }

    // Manter a conexão aberta
  } catch (err) {
    console.error("Erro no OPC-UA:", err);
  }
}

connectAndMonitor();
