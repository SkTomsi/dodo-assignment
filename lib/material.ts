export type Material =
	| "paper"
	| "thermal"
	| "foil"
	| "pearl"
	| "metal"
	| "glass"
	| "grain"
	| "gold";
export type SurfaceTool = "touch" | "move";
export type ArtworkCapture = () => HTMLCanvasElement | null;

export const materials: {
	value: Material;
	label: string;
	description: string;
	color: string;
}[] = [
	{
		value: "paper",
		label: "Paper",
		description: "Your original print, untouched.",
		color: "linear-gradient(135deg, #eee9df, #c9c3b6)",
	},
	{
		value: "thermal",
		label: "Thermal",
		description:
			"Warm the print from amber to coral to violet. Let it cool back to ink.",
		color: "linear-gradient(135deg, #ffbd63, #f66c91, #765bf1)",
	},
	{
		value: "foil",
		label: "Holo foil",
		description:
			"A continuous holographic film. Move the light to shift its spectrum.",
		color: "conic-gradient(from 45deg, #96dfde, #d7b3fc, #f8d38c, #96dfde)",
	},
	{
		value: "pearl",
		label: "Pearl",
		description: "Move the light. Let the printed texture catch it.",
		color: "linear-gradient(135deg, #ecf1da, #c2dddf, #dac7ea, #f8e9d7)",
	},
	{
		value: "metal",
		label: "Metal",
		description:
			"Brushed silver with directional reflections and fine machining lines.",
		color:
			"repeating-linear-gradient(175deg, #85919e 0px, #dce2e8 1px, #a7b2bf 2px, #e8edf2 4px)",
	},
	{
		value: "glass",
		label: "iOS glass",
		description:
			"Liquid-glass-inspired refraction, soft frost, and a luminous moving highlight.",
		color:
			"linear-gradient(135deg, #d2e7ef, #f9fdff 35%, #a5c3dd 47%, #e2eef8 54%, #d6cff1)",
	},
	{
		value: "grain",
		label: "Grain",
		description:
			"Soft, mottled pigment and tactile speckles. A matte, grainy print finish.",
		color:
			"radial-gradient(circle at 25% 30%, #ffb6a4, transparent 60%), repeating-conic-gradient(#eb6254 0% 25%, #ff8d74 0% 50%) 0 0 / 3px 3px",
	},
	{
		value: "gold",
		label: "Gold",
		description:
			"Warm brushed gold, bronze shadows, and polished champagne reflections.",
		color:
			"linear-gradient(125deg, #6e4216, #d9a844 25%, #fff0b3 43%, #bc7f24 55%, #e9c66e 80%, #815119)",
	},
];

const materialModes: Record<Material, number> = {
	thermal: 0,
	foil: 1,
	pearl: 2,
	metal: 3,
	glass: 4,
	grain: 5,
	gold: 6,
	paper: 7,
};

const vertex = `attribute vec2 position;
varying vec2 uv;
void main() { uv = position * .5 + .5; gl_Position = vec4(position, 0., 1.); }`;

const fragment = `precision highp float;
varying vec2 uv;
uniform sampler2D image, heatMap;
uniform vec2 light, texel;
uniform float mode, strength;
float hash(vec2 point) {
  return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 point) {
  vec2 cell = floor(point);
  vec2 blend = fract(point);
  blend = blend * blend * (3. - 2. * blend);
  return mix(mix(hash(cell), hash(cell + vec2(1., 0.)), blend.x), mix(hash(cell + vec2(0., 1.)), hash(cell + vec2(1., 1.)), blend.x), blend.y);
}
vec3 imageColor(vec2 point) {
  vec4 sampleColor = texture2D(image, point);
  return sampleColor.rgb / max(sampleColor.a, .0001);
}
float luminance(vec2 point) {
  vec4 sampleColor = texture2D(image, point);
  return dot(sampleColor.rgb / max(sampleColor.a, .0001), vec3(.299, .587, .114));
}
void main() {
  vec4 sampleColor = texture2D(image, uv);
  float alpha = sampleColor.a;
  vec3 base = sampleColor.rgb / max(alpha, .0001);
  float density = 1. - dot(base, vec3(.299, .587, .114));
  vec2 delta = uv - light;
  float spot = exp(-dot(delta, delta) * 8.);
  vec2 relief = vec2(luminance(uv + vec2(texel.x * 2., 0.)) - luminance(uv - vec2(texel.x * 2., 0.)), luminance(uv + vec2(0., texel.y * 2.)) - luminance(uv - vec2(0., texel.y * 2.)));
  float phase = uv.x * 1.7 + uv.y * .8 + dot(delta, vec2(1.2, -.8)) + density * .3;
  vec3 rainbow = .55 + .45 * cos(6.283185 * (phase + vec3(0., .33, .67)));
  vec3 color;
  if (mode < .5) {
    float heat = texture2D(heatMap, uv).a;
    vec3 amber = vec3(1., .64, .20);
    vec3 coral = vec3(1., .20, .31);
    vec3 violet = vec3(.54, .26, .90);
    vec3 pigment = mix(amber, coral, smoothstep(.15, .6, heat));
    pigment = mix(pigment, violet, smoothstep(.65, 1., heat));
    float paperTone = dot(base, vec3(.299, .587, .114));
    vec3 warm = pigment * (.55 + .45 * paperTone) + (1. - density) * vec3(.16, .08, .04);
    warm += (noise(uv * 280.) - .5) * .035;
    color = mix(base, warm, smoothstep(0., .7, heat));
  } else if (mode < 1.5) {
    float sweep = delta.x * .85 + delta.y * .55 + density * .025;
    float shine = exp(-pow(sweep * 7., 2.));
    float fineBand = exp(-pow((sweep + .14) * 32., 2.));
    float filmPhase = uv.x * .8 + uv.y * 1.2 - light.x * .9 + light.y * .6 + density * .16;
    vec3 film = .55 + .45 * cos(6.283185 * (filmPhase + vec3(0., .33, .67)));
    vec3 substrate = mix(base, vec3(1. - density), .55);
    color = substrate * (.5 + film * .65) + film * .1 + shine * .2 + fineBand * .18;
    color += dot(relief, light - uv) * .12;
  } else if (mode < 2.5) {
    float shine = exp(-pow((delta.x + delta.y * .65) * 5., 2.));
    color = base * (.86 + dot(relief, normalize(light - uv + vec2(.0001))) * .5) + rainbow * shine * .22 + shine * .18;
  } else if (mode < 3.5 || (mode > 5.5 && mode < 6.5)) {
    float sweep = delta.x + delta.y * .28;
    float reflection = exp(-pow(sweep * 5., 2.));
    float highlight = exp(-pow((sweep - .065) * 28., 2.));
    float brushed = (noise(vec2(uv.x * 18., uv.y * 900.)) - .5) * .065;
    float luminance = 1. - density;
    float reliefLight = dot(relief, normalize(light - uv + vec2(.0001))) * .16;
    if (mode > 5.5) {
      vec3 gold = mix(vec3(.40, .22, .055), vec3(.95, .70, .27), reflection);
      color = gold * (.20 + luminance * .8) + highlight * vec3(.36, .29, .16) + brushed * vec3(1., .76, .4) + reliefLight;
    } else {
      float silver = (.14 + luminance * .64) * (.6 + reflection * .6);
      color = vec3(silver) * vec3(.93, .96, 1.) + highlight * .24 + brushed + reliefLight;
    }
  } else if (mode < 4.5) {
    vec2 refraction = delta * .012 + relief * .003;
    vec2 samplePoint = uv + refraction;
    vec2 blur = texel * 3.;
    vec3 frost = imageColor(samplePoint) * .4;
    frost += imageColor(samplePoint + vec2(blur.x, 0.)) * .15;
    frost += imageColor(samplePoint - vec2(blur.x, 0.)) * .15;
    frost += imageColor(samplePoint + vec2(0., blur.y)) * .15;
    frost += imageColor(samplePoint - vec2(0., blur.y)) * .15;
    float sweep = delta.x + delta.y * .7;
    float reflection = exp(-pow(sweep * 6., 2.));
    float rim = exp(-pow((sweep - .17) * 45., 2.));
    vec3 refracted = vec3(imageColor(samplePoint + texel * 2.).r, frost.g, imageColor(samplePoint - texel * 2.).b);
    color = mix(base, mix(frost, refracted, .25), .4) * vec3(.91, .96, 1.);
    color += reflection * vec3(.13, .15, .18) + rim * .25 + length(relief) * .045;
  } else if (mode < 5.5) {
    float fine = hash(floor(uv / texel));
    float coarse = noise(uv * 360.);
    float mottling = noise(uv * 35.);
    float pigment = (fine - .5) * .14 + (coarse - .5) * .12;
    color = base * (.97 + mottling * .06) + pigment + spot * .01;
    color -= step(.985, fine) * .08;
  } else {
    color = base;
  }
  color = mix(base, clamp(color, 0., 1.), strength);
  gl_FragColor = vec4(color * alpha, alpha);
}`;

export function createMaterialRenderer(canvas: HTMLCanvasElement) {
	const gl = canvas.getContext("webgl", {
		alpha: true,
		premultipliedAlpha: true,
		antialias: false,
	});
	if (!gl) return null;
	const shaders: WebGLShader[] = [];
	const program = gl.createProgram();
	const buffer = gl.createBuffer();
	const texture = gl.createTexture();
	const heatTexture = gl.createTexture();
	function dispose() {
		for (const shader of shaders) gl?.deleteShader(shader);
		gl?.deleteTexture(texture);
		gl?.deleteTexture(heatTexture);
		gl?.deleteBuffer(buffer);
		gl?.deleteProgram(program);
	}
	try {
		if (!program || !buffer || !texture || !heatTexture)
			throw new Error("Could not allocate shader resources.");
		const shaderSources: [number, string][] = [
			[gl.VERTEX_SHADER, vertex],
			[gl.FRAGMENT_SHADER, fragment],
		];
		for (const [type, code] of shaderSources) {
			const shader = gl.createShader(type);
			if (!shader) throw new Error("Could not create shader.");
			shaders.push(shader);
			gl.shaderSource(shader, code);
			gl.compileShader(shader);
			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
				throw new Error("Could not compile material shader.");
			gl.attachShader(program, shader);
		}
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS))
			throw new Error("Could not link material shader.");
		const bindProgram = gl.useProgram.bind(gl);
		bindProgram(program);
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
			gl.STATIC_DRAW,
		);
		const position = gl.getAttribLocation(program, "position");
		gl.enableVertexAttribArray(position);
		gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.uniform1i(gl.getUniformLocation(program, "image"), 0);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, heatTexture);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			1,
			1,
			0,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			new Uint8Array(4),
		);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.uniform1i(gl.getUniformLocation(program, "heatMap"), 1);
		const lightLocation = gl.getUniformLocation(program, "light");
		const modeLocation = gl.getUniformLocation(program, "mode");
		const strengthLocation = gl.getUniformLocation(program, "strength");
		const texelLocation = gl.getUniformLocation(program, "texel");
		return {
			update(source: HTMLCanvasElement) {
				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_2D, texture);
				gl.texImage2D(
					gl.TEXTURE_2D,
					0,
					gl.RGBA,
					gl.RGBA,
					gl.UNSIGNED_BYTE,
					source,
				);
				gl.uniform2f(texelLocation, 1 / source.width, 1 / source.height);
			},
			updateHeat(mask: HTMLCanvasElement) {
				gl.activeTexture(gl.TEXTURE1);
				gl.bindTexture(gl.TEXTURE_2D, heatTexture);
				gl.texImage2D(
					gl.TEXTURE_2D,
					0,
					gl.RGBA,
					gl.RGBA,
					gl.UNSIGNED_BYTE,
					mask,
				);
			},
			draw(
				material: Material,
				light: { x: number; y: number },
				strength: number,
			) {
				if (gl.isContextLost()) throw new Error("Material context lost.");
				gl.viewport(0, 0, canvas.width, canvas.height);
				gl.uniform2f(lightLocation, light.x, 1 - light.y);
				gl.uniform1f(modeLocation, materialModes[material]);
				gl.uniform1f(strengthLocation, strength);
				gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
			},
			dispose,
		};
	} catch {
		dispose();
		return null;
	}
}
