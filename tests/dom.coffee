$ = require('../lib/minidollar')
_ = require('./helpers')

describe 'minidollar', ->

  # ID
  describe '#id selector', ->
    beforeEach (test = _.loadFixture '''
      <div id="unique"></div>
    ''').begin

    afterEach test.end

    it 'should match single elements', ->
      expect($('#unique').tagName).toBe 'DIV'

  # CLASS
  describe '.class selector', ->
    beforeEach (test = _.loadFixture '''
      <span class="generic"></span>
      <span class="generic"></span>
    ''').begin

    afterEach test.end

    it 'should match multiple elements', ->
      expect($('.generic').length).toBe 2
      expect($('.generic')[0].tagName).toBe 'SPAN'

  # NAME
  describe '@name selector', ->
    beforeEach (test = _.loadFixture '''
      <meta name="keyword">
      <meta name="keyword">
    ''').begin

    afterEach test.end

    it 'should match multiple elements', ->
      expect($('@keyword').length).toBe 2
      expect($('@keyword')[0].tagName).toBe 'META'

  # TAG
  describe '*tag selector', ->
    beforeEach (test = _.loadFixture '''
      <b>bold</b>
    ''').begin

    afterEach test.end

    it 'should match multiple elements', ->
      expect($('*b').length).toBe 1
      expect($('*b')[0].tagName).toBe 'B'

  # CUSTOM
  describe 'complex selectors', ->
    beforeEach (test = _.loadFixture '''
      <span data-something>:D</span>
    ''').begin

    afterEach test.end

    it 'should fallback to querySelectorAll()', ->
      expect($('span[data-something]')[0].textContent).toBe ':D'

  describe 'wrapped elements', ->
    beforeEach (test = _.loadFixture '''
      <data class="empty"></data>
      <data class="raw_data" data-value="scalar" data-int="10" data-bool="true"></data>
      <data class="mixed_data" data-json-value="{&quot;key&quot;:&quot;value&quot;}"></data>
    ''').begin

    afterEach test.end

    it 'can read attributes', ->
      expect($('.empty').getAttribute('class')).toBe 'empty'

    it 'can write attributes', ->
      $('*data').setAttribute('foo', 'bar')
      expect($('.raw_data').getAttribute('foo')).toBe 'bar'

    it 'can read (only) data-attributes', ->
      expect($('*data')[1].data()).toEqual value: 'scalar', bool: true, int: 10

    it 'can read (only) JSON from data-attributes', ->
      expect($('.mixed_data').data('json-value')).toEqual key: 'value'

    it 'can play through the classList API', ->
      expect($('.empty').classList.contains('empty')).toBe true
