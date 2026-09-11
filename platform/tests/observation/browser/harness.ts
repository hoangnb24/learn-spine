import "../../render/browser/harness";
import { ObservationService } from "../../../src/observation";
import { mountPreview, imageContent } from "../../../src/observation/media";
Object.assign(window, {
  observation: { ObservationService, mountPreview, imageContent },
});
