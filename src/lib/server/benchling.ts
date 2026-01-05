import axios from "axios";
import {
  NewOrder,
  OrderServiceItem,
  OrderedSample,
  Sample,
} from "src/types/order";
import { benchlingConfig } from "src/private-config";
import {
  CustomBenchlingEntity,
  CustomerOrder,
  CustomerSample,
  GenomeSequencingSample,
  MetagenomicsSample,
  QPCRSample,
} from "src/types/benchling";
import _ from "lodash";
import { serviceFromId } from "src/utils/service-from-sample-id";

const apiKey = benchlingConfig.apiKey;
const password = ""; // blank password; api key only

const authHeader = {
  Authorization: `Basic ${Buffer.from(`${apiKey}:${password}`).toString(
    "base64",
  )}`,
  "Content-Type": "application/json",
  Accept: "application/json",
};

// Note: This need to match exactly the dropdown option id in Benchling
// otherwise the order will fail.
const SAMPLE_TYPE_BENCHLING_IDS: Record<string, string> = {
  "Water (Unfiltered)": "sfso_e3yzovMg",
  "Water (Filter)": "sfso_hqUrFS89",
  Tissue: "sfso_hGcN2aMp",
  Sediment: "sfso_exuNcVDN",
  Mucosal: "sfso_tjnlLokJ",
  Biofilter: "sfso_Zu4WNXVJ",
};

// Note: This need to match exactly the dropdown option id in Benchling
// otherwise the order will fail.
const HOST_SPECIES_BENCHLING_IDS: Record<string, string> = {
  "Atlantic Salmon (Salmo salar)": "sfso_JRBPsHcL",
  "Rainbow Trout (Oncorhynchus mykiss)": "sfso_hentFm6Z",
  "European Carp (Cyprinus carpio)": "sfso_dpd70eZn",
  "Ballan Wrasse (Labrus bergylta)": "sfso_hg4qJfSH",
  "Lumpfish (Cyclopterus lumpus)": "sfso_XJBKBLxX",
  "Yellow Perch (Perca flavescens)": "sfso_IVtnR5R9",
  "Atlantic Cod (Gadus morhua)": "sfso_EhxhXmzb",
  "European Bass (Dicentrarchus labrax)": "sfso_zxpul8c5",
  "Gilthead Seabream (Sparus aurata)": "sfso_0n5nL9ff",
  "Turbot (Scophthalmus maximus)": "sfso_umfJFG9I",
  "Whiteleg Shrimp (Litopenaeus vannamei)": "sfso_sNpp7ONu",
  "Tiger Shrimp (Penaeus monodon)": "sfso_W9bBy1di",
  "Abalone (Haliotidae)": "sfso_wIMbyAJW",
  "Oyster (All species)": "sfso_T5Czo8TC",
};

async function createFolder(name: string): Promise<string> {
  const apiUrl = `${benchlingConfig.apiUrl}/folders`;

  const requestData = {
    name: name,
    parentFolderId: "lib_XZ3DhMfj", // customer Orders & Samples
  };

  try {
    const response = await axios.post(apiUrl, requestData, {
      headers: authHeader,
    });
    return response.data.id;
  } catch (error) {
    console.error("Error making the request:", error.message);
    return Promise.reject(error);
  }
}

async function createCustomEntity<T>(
  entity: CustomBenchlingEntity<T>,
): Promise<string> {
  const apiUrl = `${benchlingConfig.apiUrl}/custom-entities`;

  try {
    const response = await axios.post(apiUrl!, entity, {
      headers: authHeader,
    });
    return response.data.id;
  } catch (error) {
    console.error("Error making the request:", error.message);
    return Promise.reject(error);
  }
}

async function checkTask(taskId: string): Promise<any> {
  const apiUrl = `${benchlingConfig.apiUrl}/tasks/${taskId}`;
  try {
    const response = await axios.get(apiUrl, {
      headers: authHeader,
    });
    if (response.data?.status != "SUCCEEDED") {
      return Promise.reject(response.data);
    }
    return response.data;
  } catch (error) {
    console.error("Error making the request:", error.message);
    return Promise.reject(error);
  }
}

// launches a long-running task and returns the Task ID of the launched task.
// the task response contains the full list of custom entities that were created.
async function bulkCreateCustomEntities<T>(
  entities: CustomBenchlingEntity<T>[],
): Promise<string> {
  const apiKey = benchlingConfig.apiKey;
  const apiUrl = `${benchlingConfig.apiUrl}/custom-entities:bulk-create`;
  const password = ""; // blank password; api key only

  const authHeader = {
    Authorization: `Basic ${Buffer.from(`${apiKey}:${password}`).toString(
      "base64",
    )}`,
    "Content-Type": "application/json",
    accept: "application/json",
  };

  try {
    const response = await axios.post(
      apiUrl!,
      { customEntities: entities },
      {
        headers: authHeader,
      },
    );
    return response.data.taskId;
  } catch (error) {
    console.error(JSON.stringify(error));
    return Promise.reject(error);
  }
}

function buildSamples(
  orderId: string,
  folderId: string,
  serviceItem: OrderServiceItem,
): CustomerSample[] {
  const samples: CustomerSample[] = [];
  for (let x = 0; x < serviceItem.numberOfSamples; x++) {
    let fields: any = {
      "Customer Order": { value: orderId },
    };

    // if (SAMPLE_TYPE_BENCHLING_IDS[serviceItem.sampleType]) {
    //   fields["Sample Type"] = {
    //     value: SAMPLE_TYPE_BENCHLING_IDS[serviceItem.sampleType],
    //   };
    // }
    // if (HOST_SPECIES_BENCHLING_IDS[serviceItem.hostSpecies]) {
    //   fields["Host Species"] = {
    //     value: HOST_SPECIES_BENCHLING_IDS[serviceItem.hostSpecies],
    //   };
    // }

    switch (serviceItem.service) {
      case "Metagenomics":
        samples.push(
          new MetagenomicsSample(`Meta_${x.toString()}`, folderId, {
            "Customer Order": { value: orderId },
          }),
        );
        break;
      case "qPCR":
        samples.push(new QPCRSample(`qPCR_${x.toString()}`, folderId, fields));
        break;
      case "GenomeSequencing":
        samples.push(
          new GenomeSequencingSample(`GenSeq_${x.toString()}`, folderId, {
            "Customer Order": { value: orderId },
          }),
        );
    }
  }
  return samples;
}

function mapValuesToObjectWithKey(
  obj: Record<string, any>,
): Record<string, any> {
  const newObj: Record<string, any> = {};

  for (const key in obj) {
    newObj[key] = { value: String(obj[key]) };
  }

  return newObj;
}

function mapAnswersToObjectWithKey(
  questionnaireAnswers: Record<string, { name: string; value: string }[]>,
) {
  function readableAnswer(response: { name: string; value: any }) {
    if (response.value == true) {
      return response.name;
    } else if (response.name == "Other") {
      return `Other: ${
        Array.isArray(response.value)
          ? `[${response.value.join(", ")}]`
          : response.value
      }`;
    } else {
      return `${response.name}: ${response.value}`;
    }
  }

  function toCapitalizedWords(k: string): string {
    var words = k.match(/[A-Za-z][a-z]*/g) || [];

    return words.map(capitalize).join(" ");

    function capitalize(word: string): string {
      return word.charAt(0).toUpperCase() + word.substring(1);
    }
  }

  const newObj: Record<string, any> = {};
  for (const key in questionnaireAnswers) {
    newObj[toCapitalizedWords(key)] = {
      value: questionnaireAnswers[key]
        .filter((x) => x.value != undefined && (x.value as any) != false)
        .map((x) => readableAnswer(x))
        .join(","),
    };
  }

  return newObj;
}

function getDateFromDateAndTime(dateStr: string, timeStr: string): Date {
  // parse the date and time strings
  const [day, month, year] = dateStr.split("/");
  const [hours, minutes] = timeStr.split(":");

  // construct the Date object (months are 0-based in JavaScript, so we subtract 1)
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hours),
    Number(minutes),
  );

  return date;
}

export async function startCreatingOrderRequest(
  order: NewOrder,
): Promise<string[]> {
  const folderId = await createFolder(order.id);
  const benchlingOrder = new CustomerOrder(order.id, folderId, {
    "Sent From": { value: "Esox Web App" },
    "Date/Time of Submission": { value: new Date(order.createdAt) },
    "Client Name": { value: order.customer.email },
  });
  benchlingOrder.customFields = mapAnswersToObjectWithKey(
    order.questionnaireAnswers,
  );

  var orderId = await createCustomEntity(benchlingOrder);

  // note: not flatMap, because Benchling doesn't allow a single bulk create for multiple entity types at once, annoyingly.
  const samples = order.requestedServices.map((s) =>
    buildSamples(orderId, folderId, s),
  );

  return Promise.all(samples.map((s) => bulkCreateCustomEntities(s)));
}

function populateSamplesOnOrder(result: any[], order: NewOrder) {
  order.orderedSamples = result
    .flatMap((r) =>
      r.response.customEntities.map((e: any) => ({
        registryId: e.entityRegistryId,
        apiId: e.id,
      })),
    )
    .map<OrderedSample>((x) => ({
      name: x.registryId,
      apiId: x.apiId,
      service: serviceFromId(x.registryId),
    }));
}

function backOffInternal<T>(
  timesLeft: number[],
  request: () => Promise<T>,
): Promise<T> {
  return request().catch((error) => {
    if (timesLeft.length > 0) {
      console.log("Backing off");
      const time = timesLeft.pop();
      return new Promise((resolve) => setTimeout(resolve, time)).then(() => {
        console.log("Backed off for " + time?.toString());
        return backOffInternal(timesLeft, request);
      });
    } else {
      return Promise.reject(error);
    }
  });
}

function backOff<T>(request: () => Promise<T>): Promise<T> {
  return backOffInternal([1000, 2000, 4000, 10000], request);
}

async function startUpdatingCustomEntities(
  customEntities: any[],
): Promise<string> {
  const apiUrl = `${benchlingConfig.apiUrl}/custom-entities:bulk-update`;
  const body = {
    customEntities: customEntities,
  };

  try {
    const response = await axios.post(apiUrl, body, {
      headers: authHeader,
    });
    return response.data.taskId;
  } catch (error) {
    console.error("Error making the request:", error.message);
    return Promise.reject(error);
  }
}

export async function updateSamples(order: NewOrder, updatedSamples: Sample[]) {
  const orderedSamples = order.orderedSamples!;
  const samplesToUpdate = updatedSamples.map((s) => ({
    update: s,
    benchlingId: orderedSamples?.find((o) => o.name == s.name)!.apiId,
  }));

  // const datestring = new Date(date);

  // const sample = new DiagnosticCustomerSample(sampleId, folderId, {
  //   "Customer Order": { value: orderId },
  //   "Date/Time Sampled": { value: getDateFromDateAndTime(datestring, time) },
  // });
  // sample.customFields = mapValuesToObjectWithKey(remainingFields);

  const customEntitiesByEntityType = _.chain(samplesToUpdate)
    .groupBy((x) => x.update.service)
    .map((grp) =>
      grp.map((x) => {
        const { samplingDateTime, ...customFields } = x.update.metadata;
        return {
          id: x.benchlingId,
          fields: samplingDateTime && {
            "Date/Time Sampled": { value: samplingDateTime },
          },
          customFields: mapValuesToObjectWithKey(customFields),
        };
      }),
    )
    .value();

  const result = await Promise.all(
    customEntitiesByEntityType.map((e) => startUpdatingCustomEntities(e)),
  ).then((taskIds) =>
    Promise.all(
      taskIds.map((taskId) => backOff(() => checkTask(taskId))),
    ).catch((error) => {
      console.error(JSON.stringify(error));
      return Promise.reject(error);
    }),
  );
  console.log(JSON.stringify(result));
}

export async function waitForTasksAndPopulateSamplesOnOrder(
  taskIds: string[],
  order: NewOrder,
): Promise<any> {
  const result = await Promise.all(
    taskIds.map((taskId) => backOff(() => checkTask(taskId))),
  ).catch((error) => {
    console.error(JSON.stringify(error));
    return Promise.reject(error);
  });

  console.log(JSON.stringify(result));
  populateSamplesOnOrder(result, order);

  return order;
}
