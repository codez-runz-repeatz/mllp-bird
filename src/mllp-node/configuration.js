class configuration {
  constructor(json) {
    this.json = json;
  }

  api() {
    return this.json.api || {};
  }

  appointments() {
    return this.json.appointments || {};
  }

  practitioners() {
    return this.json.practitioners || false;
  }

  notes() {
    return this.json.notes || false;
  }

  hl7() {
    return this.json.hl7 || {};
  }

  emr() {
    return this.json.emr || {};
  }

  // Direct value getters with defaults
  apiKey() {
    return this.json.api?.key ?? "<placeholder_api_key>";
  }

  apiBaseUrl() {
    return this.json.api?.baseurl ?? "'https://stg.lyrebirdhealth.com/partnerapi/v1";
  }

  practitionersRoute(defaultValue = '/practitioners') {
    return this.json.api?.practitioners ?? defaultValue;
  }

  notesRoute(defaultValue = '/notes') {
    return this.json.api?.notes ?? defaultValue;
  }

  appointmentsRoute(defaultValue = '/appointments') {
    return this.json.appointments?.route ?? defaultValue;
  }

  appointmentsMapping(defaultValue = 'hl7-mapping.json') {
    return this.json.appointments?.mapping ?? defaultValue;
  }

  practitionersMapping(defaultValue = 'hl7-mapping-practitioner.json') {
    return this.json.practitioners?.mapping ?? defaultValue;
  }

  hl7Port(defaultValue = 6969) {
    return this.json.hl7?.port ?? defaultValue;
  }

  emrHost(defaultValue = 'localhost') {
    return this.json.emr?.host ?? defaultValue;
  }

  emrPort(defaultValue = 5000) {
    return this.json.emr?.port ?? defaultValue;
  }
}

module.exports = configuration;